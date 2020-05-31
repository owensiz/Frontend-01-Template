// ===== css优先级
// 写一个specificity生成selector的优先级（使用四元组 ），一个compare函数比较优先级

const css = require('css');
const EOF = Symbol('EOF'); //end of file
let currentToken = null; //用一个全局变量，存当前 元素 {type: '', tagName: ''}
let currentAttribute = null; //用一个全局变量，存当前 属性 {name: '', value: ''}
let currentTextNode = null; //设一个全局变量，存当前文本节点

let stack = [
  {
    type: 'document',
    children: [],
  },
];
// 默认塞一个document，最后直接取stack[0]把整棵树取出来

let rules = []; //用一个数组暂存css规则
function addCSSRules(text) {
  let ast = css.parse(text);
  // console.log(JSON.stringify(ast, null, '   '));
  rules.push(...ast.stylesheet.rules);
}

function specificity(selector) {
  // [行内style，id, class, tag]
  // 此处只支持id class tag
  let p = [0, 0, 0, 0];
  let selectorParts = selector.split(' ');
  for (let part of selectorParts) {
    // 数组迭代多用for-of
    if (part.charAt(0) == '#') {
      // 取字符串第一个字符，使用charAt(0)
      p[1] += 1;
    } else if (part.charAt(0) == '.') {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

function match(element, selector) {
  if (!selector || !element.attributes) {
    // console.log('something wrong');
    return false;
  }
  // 支持# . tag这三种选择器
  if (selector.charAt(0) == '#') {
    let attr = element.attributes.filter((attr) => (attr.name = 'id'))[0];
    if (attr && attr.value === selector.replace('#', '')) {
      // console.log('id selector match');
      return true;
    }
  } else if (selector.charAt(0) == '#') {
    let attr = element.attributes.filter((attr) => (attr.name = 'class'))[0];
    if (attr && attr.value === selector.replace('.', '')) {
      // console.log('class selector match');
      return true;
    }
  } else {
    if (element.tagName === selector) {
      // console.log('tag selector match');
      return true;
    }
  }
  return false;
}

function computeCSS(element) {
  let elements = stack.slice().reverse();

  // 为元素创建一个computedStyle属性
  if (!element.computedStyle) {
    element.computedStyle = {};
  }
  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(' ').reverse();
    // 如果最后一项都不match，直接continue掉，飞上去走进下一个迭代；是一个优化
    // console.log(element.tagName, ' | ', selectorParts[0]);
    if (!match(element, selectorParts[0])) {
      //   console.log('the first does not match');
      //引入一个match函数
      continue;
    }
    // 一个双重循环的match 用 i 表示每个 element，用 j 表示每个 selector
    let matched = false;
    let j = 1; // 从第二个开始匹配；第一个selector在第一步已经走了
    for (let i = 0; i < elements.length; i++) {
      // 如果ele与sele匹配，sele往前走一个
      if (match(elements[i], selectorParts[j])) {
        j++;
      }
    }
    // 最后ele走完了的时候，如果sele也走完了，就匹配成功
    if (j >= selectorParts.length) {
      matched = true;
    }
    // 如果match
    if (matched) {
      let sp = specificity(rule.selectors[0]);

      let computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
          //   { "width": {
          //         "value": "100px" //属性值
          //         "specificity": [0, 1, 0, 2] //优先级
          //     }}
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          // 如果后来的优先级更高，就覆盖原有的属性
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
      // console.log('computedStyle', JSON.stringify(element.computedStyle, null, 4));
    }
  }
}

function emit(token) {
  let top = stack[stack.length - 1];
  if (token.type == 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    };
    element.tagName = token.tagName;
    for (let p in token) {
      if (p != 'type' && p != 'tagName') {
        element.attributes.push({ name: p, value: token[p] });
      }
    }
    // 添加调用写在元素的创建之后,tagName和属性都加好之后，挂载之前；意即为尽可能早的compute css
    computeCSS(element);
    top.children.push(element);
    element.parent = top;
    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  } else if (token.type == 'endTag') {
    if (top.tagName != token.tagName) {
      throw new Error('Tag start end does not match!');
    } else {
      // --------------开始--------------------------- 遇到css标签时，添加css规则
      if (top.tagName == 'style') {
        // top：进栈出栈的top一定是element 进栈时style标签还没挂到element上，出栈时已经挂好了
        addCSSRules(top.children[0].content);
      }
      // --------------结束---------------------------
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type == 'text') {
    // handle text node
    if (currentTextNode == null) {
      currentTextNode = {
        type: 'text',
        content: '',
      };
      top.children.push(currentTextNode);
    }
    // 多个文本节点需要合并
    currentTextNode.content += token.content;
  }
}

function data(c) {
  if (c == '<') {
    return tagOpen;
  } else if (c == EOF) {
    emit({ type: 'EOF' });
    return;
  } else {
    emit({ type: 'text', content: c });
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
    emit({ type: 'text', content: c });
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

// 属性名之前 <div name="a">
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
    // <html maaa=a >遇到空格，就结束了，于是把当前属性运用到当前元素上 下面遇到 / 和 > ，同理
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
  // console.log(stack[0]);
};
