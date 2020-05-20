const EOF = Symbol("EOF"); //end of file
let currentToken = null;
let currentAttribute = null;

function emit(token) {
  if (token.type != "text") console.log(JSON.stringify(token));
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
    currentToken += c;
    return tagName;
  }
}

// 属性名之前
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f]$/)) {
    return beforeAttributeName;
  } else if (c == ">" || c == "/" || c == EOF) {
    return afterAttributeName(c);
    // return data;
  } else if (c == "=") {
    // return beforeAttributeName;
  } else {
    // return beforeAttributeName;
    // FOCUS HERE
    currentAttribute = {
      name: "",
      value: "",
    };
    return afterAttributeName(c);
  }
}

// 属性名
function attributeName(c) {
  console.log(currentAttribute);
  if (c.match(/^[\t\n\f]$/) || c == ">" || c == "/" || c == EOF) {
    return afterAttributeName(C);
  } else if (c == "=") {
    return beforeAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == '"' || c == "'" || c == "<") {
    // 单引号/双引号/左尖括号
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

// 属性 值 之前
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f]$/) || c == ">" || c == "/" || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    // 遇到双引号，进入双引号属性值的状态
    return doubleQuotedAttributeValue;
  } else if (c == "'") {
    // 遇到单引号，进入单引号属性值的状态
    return singleQuotedAttributeValue;
  } else if (c == ">") {
  } else {
    // 进入无引号属性值的状态
    return UnquotedAttributeValue(c);
    return;
  }
}

// 双引号属性值
function doubleQuotedAttributeValue(c) {
  // 遇到双引号
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == "\u0000") {
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
  } else if (c == "\u0000") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

// 无引号属性值
function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value; // TODO:
    return beforeAttributeName;
  } else if (c == "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == "\u0000") {
  } else if (c == "'" || c == '"' || c == "=" || c == "`") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}

// 带引号的属性值之后
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
    // TODO:这里很奇怪
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
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
