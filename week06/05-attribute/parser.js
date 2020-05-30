// =====处理属性
// 前面都一样，从 before attribute 开始变
// 考虑 <html maaa=a >

const EOF = Symbol('EOF'); //end of file
let currentToken = null; //用一个全局变量，存当前 元素 {type: '', tagName: ''}
let currentAttribute = null; //用一个全局变量，存当前 属性 {name: '', value: ''}

function emit(token) {
  if (token.type != 'text') console.log(token);
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
  if (c == '/') return endTagOpen;
  else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: '',
    };
    return tagName(c);
  } else {
    emit({
      type: 'text',
      content: c,
    });
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
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c == '>') {
    emit(currentToken);
    return data;
  } else {
    currentToken.tagName += c;
    return tagName;
  }
}

// 属性名之前
// <div name="a">
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '>' || c == '/' || c == EOF) {
    return afterAttributeName(c);
  } else if (c == '=') {
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

// 属性名
function attributeName(c) {
  // console.log(currentAttribute);
  if (c.match(/^[\t\n\f ]$/) || c == '>' || c == '/' || c == EOF) {
    return afterAttributeName(c);
  } else if (c == '=') {
    return beforeAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == '"' || c == "'" || c == '<') {
    // 单引号/双引号/左尖括号
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

// <div name = 'abc'></div>
function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName();
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c == '=') {
    return beforeAttributeValue;
  } else if (c == EOF) {
  } else if (c == '>') {
    // <div name>
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken); // 不明白
    return data;
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentToken = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

// 属性 值 之前 ;等属性值是 单引号、双引号、无引号
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '>' || c == '/' || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    // 遇到双引号，进入双引号属性值的状态
    return doubleQuotedAttributeValue;
  } else if (c == "'") {
    // 遇到单引号，进入单引号属性值的状态
    return singleQuotedAttributeValue;
  } else if (c == '>') {
  } else {
    // 进入无引号属性值的状态
    return UnquotedAttributeValue(c);
  }
}

// 双引号属性值
function doubleQuotedAttributeValue(c) {
  // 遇到双引号
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

// 单引号属性值
function singleQuotedAttributeValue(c) {
  // 遇到单引号
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == '\u0000') {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

// 带引号的属性值之后
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue; //remind here
  }
}

// 无引号属性值
function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // <html maaa=a >遇到空格，就结束了，于是把当前属性运用到当前元素上
    // 下面遇到 / 和 > ，同理
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == '\u0000') {
  } else if (c == "'" || c == '"' || c == '=' || c == '`') {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
  if (c == '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken);
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
