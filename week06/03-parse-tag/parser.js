// =======初始化状态机
const EOF = Symbol('EOF'); //end of file
// 为什么一定要有EOF
// 很多文本节点，可能会等待补全；搞一个symbol的文件结尾，作为结束的唯一特殊标识
// 使用这一技巧，处理绝大多数需要结束标志的场景
function data(c) {}

module.exports.parseHTML = function parseHTML(html) {
  // console.log(html);
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
};
