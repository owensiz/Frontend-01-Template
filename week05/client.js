const net = require('net');
// 底层的net库，而非http 来实现

class Request {
  // method: host + port + path body: k/v headers
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.path = options.path || '/';
    this.port = options.port || 80;
    this.body = options.body || {};
    this.headers = options.headers || {};
    // 根据transfer-encoding 来解析
    this.bodyParser = null;
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // support 2 types for now
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join('&');
    }
    this.headers['Content-Length'] = this.bodyText.length;
  }
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join('\r\n')}\r
\r
${this.bodyText}`;
  }
  open(method, url) {}
  // send(body) {}
  send(connection) {
    const parser = new ResponseParser();
    return new Promise((resolve, reject) => {
      // 根据已有的connection来send
      if (connection) {
        connection.write(this.toString());
      } else {
        // 也可以主动创建connection来send
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );
      }
      // 流式数据，不是ondata的时候就传完了，会发多个包， 会触发多次 所以不是ondata后面直接产生response
      // 需要一个ResponsePaser来产生一个Response
      connection.on('data', (data) => {
        // ondata的时候，把data喂给response parser
        parser.receive(data.toString());
        // console.log('wwtest', parser.statusLine);
        // console.log('wwtest', parser.headers);
        // resolve(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
        }
        connection.end();
      });
      connection.on('end', () => {
        reject('disconnected from server');
      });
    });
  }
}

class Response {}
class ResponseParser {
  constructor() {
    // 状态机 状态行 - 状态行的\r\n - header的name - header的value - header行结束 - 可能会有两个\r\n
    this.WATING_STATUS_LINE = 0;
    this.WATING_STATUS_LINE_END = 1;
    this.WATING_HEADER_NAME = 2;
    this.WATING_HEADER_SPACE = 3;
    this.WATING_HEADER_VALUE = 4;
    this.WATING_HEADER_LINE_END = 5;
    this.WATING_HEADER_BLOCK_END = 6;
    this.WATING_BODY = 7;
    // 其他
    this.currentStatus = this.WATING_STATUS_LINE;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
  }
  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }
  get response() {
    //HTTP/1.1 200 OK
    const regExp = this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\S\s]+)/);
    // console.log('==========',this.statusLine);
    return {
      // statusCode: regExp.$1,
      // statusText: regExp.$2,
      statusCode: regExp[1],
      statusText: regExp[2],
      headers: this.headers,
      body: this.bodyParser.content.join(''),
    };
  }
  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }
  receiveChar(char) {
    // 大型if-else现场
    if (this.currentStatus === this.WATING_STATUS_LINE) {
      // 0 -> 1
      if (char === '\r') {
        this.currentStatus = this.WATING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.currentStatus === this.WATING_STATUS_LINE_END) {
      // 1 -> 2
      if (char === '\n') this.currentStatus = this.WATING_HEADER_NAME;
    } else if (this.currentStatus === this.WATING_HEADER_NAME) {
      // 2 -> 3
      if (char === ':') {
        this.currentStatus = this.WATING_HEADER_SPACE;
      } else if (char === '\r') {
        // 使用这个状态吃掉一个杠n
        // 2 -> 6
        this.currentStatus = this.WATING_HEADER_BLOCK_END;
        // 此处开始解析body
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser();
        }
      } else {
        this.headerName += char;
      }
    } else if (this.currentStatus === this.WATING_HEADER_SPACE) {
      // 3 -> 4
      if (char === ' ') this.currentStatus = this.WATING_HEADER_VALUE;
    } else if (this.currentStatus === this.WATING_HEADER_VALUE) {
      // 4 -> 5
      if (char === '\r') {
        this.currentStatus = this.WATING_HEADER_LINE_END;
        // 由于header是有多行的
        this.headers[this.headerName] = this.headerValue;
        this.headerName = '';
        this.headerValue = '';
      } else {
        this.headerValue += char;
      }
    } else if (this.currentStatus === this.WATING_HEADER_LINE_END) {
      // 5 -> 2
      if (char === '\n') {
        // 由于header是有多行的，这里产生了循环
        this.currentStatus = this.WATING_HEADER_NAME;
      }
    } else if (this.currentStatus === this.WATING_HEADER_BLOCK_END) {
      // 6 -> 7
      if (char === '\n') this.currentStatus = this.WATING_BODY;
    } else if (this.currentStatus === this.WATING_BODY) {
      // 7
      // 转发给bodyParser
      this.bodyParser.receiveChar(char);
    }
  }
}

// trunk函数也是一个状态机
// 一行一个十进制数字， 跟着数字长度的字符，再空一行，跟着字符，直到数字为0
// 规则是每次读一个数字，然后读固定的字符，然后忽略掉所有的回车；reading trunk的时候需要搞个计数器
// 2
// ok
// 0
class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  receiveChar(char) {
    // 用json包一下，可以看见杠n杠r
    // console.log('/////////char//', JSON.stringify(char));
    // console.log(this.current);
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          // console.log('=======', this.content);
          this.isFinished = true;
        }
        this.current = this.WAITING_LENGTH_LINE_END;
      } else {
        // 字符串转十进制数字
        this.length *= 10;
        this.length = char.charCodeAt(0) - '0'.charCodeAt(0); // Number(char)
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNK;
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char);
      this.length--;
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE;
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END;
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

// test code
void (async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    path: '/',
    port: '8088',
    headers: {
      ['X-Foo2']: 'customed',
    },
    body: {
      name: 'ww',
    },
  });
  const response = await request.send();
  console.log('///////////', response);
})();

// //
// // target server: { host: '127.0.0.1', port: 8088 }
// // {host: 'https://www.baidu.com/', port: 80}
// const client = net.createConnection({ host: '127.0.0.1', port: 8088 }, () => {
//   // 'connect' listener.
//   console.log('connected to server!');
//   // client.write(
//   //   'POST / HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 11\r\n\r\nname=winter'
//   // );

//   // PAY ATTENTION： no indentation in template string here
//   //   client.write(`POST / HTTP/1.1\r
//   // Content-Type: application/x-www-form-urlencoded\r
//   // Content-Length: 11\r
//   // \r
//   // name=winter`);
//   let request = new Request({
//     method: 'POST',
//     host: '127.0.0.1',
//     path: '/',
//     port: '8088',
//     headers: {
//       ['X-Foo2']: 'customed',
//     },
//     body: {
//       name: 'ww',
//     },
//   });
//   // console log will do default toString action.
//   // console.log(request.toString());
//   client.write(request.toString());
// });
// client.on('data', (data) => {
//   console.log(data.toString());
//   client.end();
// });
// client.on('end', () => {
//   console.log('disconnected from server');
// });
