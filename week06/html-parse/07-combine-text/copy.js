const arr = [];
let item = {};
arr.push(item);
item.name = 1 // 值拷贝和属性拷贝
console.log(arr); // [{name: 1}]

const arr = [];
let item = {};
arr.push(item);
item = {name: 1} // 值拷贝和属性拷贝
console.log(arr); // [{}]