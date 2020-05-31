function getStyle(element) {
  // 加了一个style对象
  if (!element.style) {
    element.style = {};
  }
  // 把 computedStyle 里面的属性依次抄过来
  for (let prop in element.computedStyle) {
    let p = element.computedStyle.value;
    element.style[prop] = element.computedStyle[prop].value;
    // 把px和数字的属性，做一个parseInt
    if (element.style[prop].toString().match(/px$/) || element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
    return element.style;
  }
}

function layout(element) {
  // 没有style就return；有style的，做一些预处理
  if (!element.computedStyle) return;
  let elementStyle = getStyle(element);

  // 去掉非flex布局的，去掉文本节点
  if (element.display !== 'flex') return;
  let items = element.children.filter((e) => e.type == 'element');

  // 按order排序
  items.sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });

  let style = elementStyle;

  // 对宽高预处理
  [('width', 'height')].forEach((size) => {
    if (style[size] == 'auto' || style[size] == '') {
      style[size] = null;
    }
  });

  // 设置一些style默认值   remind these default values
  if (!style.flexDirection || style.flexDirection == '') {
    style.flexDirection = 'row';
  }
  if (!style.alignItems || style.alignItems == '') {
    style.alignItems = 'stretch';
  }
  if (!style.justifyContent || style.justifyContent == '') {
    style.justifyContent = 'flex-start';
  }
  if (!style.flexWrap || style.flexWrap == '') {
    style.flexWrap = 'nowrap';
  }
  if (!style.alignContent || style.alignContent == '') {
    style.alignContent = 'stretch';
  }

  // 10 个概念
  // mainSize 主轴尺寸
  // mainStart, mainEnd 主轴方向
  // ** mainBase 主轴排版的起点：从左到右排，起点为0；从右向左排，起点为width
  // ** mainSign 主轴排布的方向：从左到右排，从mainBase基础上加，故为正+；否则为负；
  let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
  if (style.flexDirection == 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;
    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection == 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;
    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection == 'colomn') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;
    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexDirection == 'colomn-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;
    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  // 啊学习一下
  if (style.flexWrap == 'wrap-reverse') {
    // wrap-reverse 影响的是交叉轴，需要交换crossStart和crossEnd 起点和终点
    let tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = -1;
  }
}

module.exports = layout;
