function create(Cls, attributeObj, ...children) {
  // console.log(arguments); //  从结果反推，然后再思考如何下手
  let o = new Cls();
  for (let name in attributeObj) {
    // o[name] = attributeObj[name];
    // 如果想要attr和property不等效
    o.mySetAttribute(name, attributeObj[name])
  }
  // console.log(children);
  for(let child of children){
    o.myAppendChild(child)
  }
  return o;
}
class Parent {
  set className(v) { // attribute
    console.log('Parent::className', v);
  }
  mySetAttribute(name,value){ // property
    console.log(name,value);
  }
  myAppendChild(child){ // children
    console.log('Parent::child', child);
  }
}
class Child {}

let component = (
  <Parent id="a" className="b">
    <Child></Child>
    <Child></Child>
    <Child></Child>
  </Parent>
);
// console.log(component);
// component.setAttribute('id', 'a');
