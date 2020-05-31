// =======解析tag；这一步写了6个状态；
// 开始标签；结束标签；自封闭标签；暂未处理属性
const EOF = Symbol('EOF'); //end of file
let currentToken = null;

// 开始
// conditions: <
function data(c) { 
  if (c == '<') {
    return tagOpen;
  } else if (c == EOF) return;
  else return data;
}

// conditions: /; char; 
function tagOpen(c) {
  if (c == '/') return endTagOpen;
  else if (c.match(/^[a-zA-Z]$/)) return tagName(c);
  else return;
}

// conditions: char;  
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

// conditions: space; /; char; >;
function tagName(c) {
  if (c.match(/^[\t\n\f]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    return tagName;
  } else if (c == '>') {
    return data;
  } else {
    return tagName;
  }
}

// 处理属性
// conditions: space; > 
// 暂时简化，除了>，其他都返回自身
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f]$/)) {
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
