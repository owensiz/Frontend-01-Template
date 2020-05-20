// =======初始化状态机
const EOF = Symbol("EOF"); //end of file
// 为什么一定要有EOF
// 很多文本节点，可能会等待补全；搞一个symbol的文件结尾，作为结束的唯一特殊标识
// 使用这一技巧，处理绝大多数需要结束标志的场景

let currentToken = null;

function emit(token) {
  // if (token.type != "text") 
  console.log(token);
}
function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: "EOF",
    });
    return;
  } else {
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c == "/") return endTagOpen;
  else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else return;
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagName(c);
  } else if (c == ">") {
  } else if (c == EOF) {
  } else {
  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken += c;
    return tagName;
  } else if (c == ">") {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f]$/)) {
    return beforeAttributeName;
  } else if (c == ">") {
    return data;
  } else if (c == "=") {
    return beforeAttributeName;
  } else {
    return beforeAttributeName;
  }
}

function selfClosingStartTag(c) {
  if (c == ">") {
    currentToken.isSelfClosing = true;
    return data;
  } else if (c == EOF) {
  } else {
  }
}
module.exports.parseHTML = function parseHTML(html) {
  // console.log(html);
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
};
