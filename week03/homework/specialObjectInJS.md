# 特殊行为的对象
> 特殊行为的对象常见的下标运算或者设置原型跟普通对象不同。

## bind 后的 function
- 跟原来的函数相关联。
- [[BoundTargetFunction]] 包装的函数对象。
- [[BoundThis]] 作为this
- [[BoundArguments]] 其他参数
- [[Call]] ( thisArgument, argumentsList )
- [[Construct]] ( argumentsList, newTarget )
- BoundFunctionCreate ( targetFunction, boundThis, boundArgs )

## Array
- 每个Array都有一个不可设置的"length"属性，根据最大的下标自动发生变化。
- 为内置方法[[DefineOwnProperty]]提供了新的定义

## String
- 每个String都有一个不可写且不可设置的"length"属性，同样也支持下标运算。
<!-- - [[GetOwnProperty]] [[DefineOwnProperty]] [[OwnPropertyKeys]] 有新定义 -->

## Arguments：
- arguments 的非负整数型下标属性跟对应的变量联动。
- [[ParameterMap]]
<!-- - [[GetOwnProperty]] ( P )
- [[DefineOwnProperty]] ( P, Desc )
-  [[Get]] ( P, Receiver )
-  [[Set]] ( P, V, Receiver )
-  [[Delete]] ( P ) -->

## Integer Indexed 
- 类型数组和数组缓冲区：跟内存块相关联，下标运算比较特殊。
- [[ViewedArrayBuffer]]
- [[ArrayLength]] 
- [[ByteOffset]]
- [[TypedArrayName]] 


## 模块的 namespace 对象
- 特殊的地方非常多，跟一般对象完全不一样，尽量只用于 import 
- [[Module]] 命名空间对应的模块导出记录
- [[Exports]] 一个已经排序的列表，存储导出的模块名称字符串
- [[Prototype]] null

## Immutable Prototype 
- Object.prototype：作为所有正常对象的默认原型，不能再给它设置原型了。
-  [[Prototype]]不变