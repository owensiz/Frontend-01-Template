// =======创建元素
// =======emit表示创建。token表示元素
// 上一步中，只是做状态迁移，啥也没改变。这一步来创建元素。
const EOF = Symbol('EOF'); //end of file
let currentToken = null; // 用一个全局变量，存当前 元素 {type: '', tagName: ''}

function emit(token) {
  // if(token.type !== 'text')
  console.log(token);
}
function data(c) {
  if (c == '<') {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: 'EOF',
    });
    return;
  } else {
    emit({
      type: 'text',
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c == '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: '', // tagname构造为空，在tagName中去改currentToken
    };
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(c);
  } else if (c == '>') {
  } else if (c == EOF) {
  } else {
  }
}

function tagName(c) {
  // condtion: <html name='aaa'
  if (c.match(/^[\t\n\f ]$/)) { // remind: there is a space using just a space; do not forget it
    return beforeAttributeName;
    // condtion: <html />
  } else if (c == '/') {
    return selfClosingStartTag;
    // condtion: <html
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c.toLowerCase();
    return tagName;
  } else if (c == '>') {
    // condtion: <html></html>
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '>') {
    return data;
  } else if (c == '=') {
    return beforeAttributeName;
  } else {
    return beforeAttributeName;
  }
}

function selfClosingStartTag(c) {
  if (c == '>') {
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
