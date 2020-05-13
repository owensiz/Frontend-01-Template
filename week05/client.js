const net = require('net');
// 底层的net库，而非http 来实现

class Request {
  // method: host + port + path
  // body: k/v
  // headers
  constructor(options) {
    this.method = options.method || 'GET';
    this.host = options.host;
    this.path = options.path || '/';
    this.port = options.port || 80;
    this.body = options.body || {};
    this.headers = options.headers || {};
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
      // 流式数据，不是ondata的时候就传完了，会发多个包， 会触发多次
      // 所以不是ondata后面直接产生response
      // 需要一个ResponsePaser来产生一个Response
      connection.on('data', (data) => {
        resolve(data.toString());
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
  constructor(){
    // 状态机
    // 状态行 - 状态行的\r\n - header的name - header的value - header行结束 - 可能会有两个\r\n
    this.WATING_STATUS_LINE = 0
    this.WATING_STATUS_LINE_END = 1
    this.WATING_HEADER_NAME = 2
    this.WATING_HEADER_VALUE = 3
    this.WATING_HEADER_LINE_END = 4
    this.WATING_HEADER_BLOCK_END = 5
    // 其他
    this.currentStatus = this.WATING_STATUS_LINE
    this.statusLint = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    
  }
  receive(string){
    for(let i=0;i<string.length;i++){
      this.receiveChar(string.charAt(i))
    }
  }
  receiveChar(char){

  }
}

class ChunkedBodyParser {
  constructor(){
  }
  receive(string){

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
  console.log(response);
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
