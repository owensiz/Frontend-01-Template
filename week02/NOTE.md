# WEEK 2

## 编程语言通识

### 用乔姆斯基谱系描述形式语言（
- 0 无限制文法
- 1 上下文相关文法（一个词在不同的地方意思不同
- 2 上下文无关文法（大部分语言都是主体上上下文无关
- 3 正则文法（要求更严格，能用正则表达式解析的文法

### 通过BNF产生式理解乔姆斯基谱系
BNF最大的技巧：它是可递归的
- 0型 - 无限制文法（等号左右可以有多个非终结符
  - ? ::= ?
- 1型 - 上下文相关文法（一个词在不同的上下文意思不同
  - ?<A>? ::= ?<B>?
- 2型 - 上下文无关文法
  - <A> ::= ?
- 3型 - 正则文法（要求更严格，能用正则表达式解析的文法
  - <A> ::= <A> ?    （正确）
  - <A> ::= ? <A>    （错误）

### 图灵完备性：
- 感性理解： 凡是可计算的是否都能计算出来
- 怎么实现图灵机（分为两个流派：
  - 命令式 - 图灵机
  -   goto
  -   if和while 有分支和循环就是图灵机
  - 声明式 - lambda
  -   递归（凡是可以递归就具备图灵完备性
- 有什么用？
-   今天的计算机语言都是图灵机的等效形式


### 动态/静态
越静态，越利于提早发现错误，越安全，越有利于大型项目

### 类型系统：
- 动态类型系统和静态类型系统
  - 不是说ts才有类型系统，而是说ts才有静态类型系统；ts就是在js上套了一个静态类型系统
- 强类型/弱类型
  - 是否可以进行隐式类型转换
  - 弱类型，开发起来容易，纠错难
- 复合类型
  - 结构体
  - 函数签名
- 编译型/解释型
- 子类型（与继承相关
  - 协变/逆变

### 一般命令式编程语言的五层结构：
- atom 原子
  - identifier
  - literal
- expression 表达式
  - atom
  - operator
  - punctuation
- statement 语句
  - expression
  - keywords
  - punctuation
- structure 结构
  - function
  - class
  - process
  - namespace
  - 。。
- program 程序
  - program
  - module
  - package
  - library

## js的词法+类型
### unicode
- unicode是个字符集，有个概念叫码点，字符和码点一一对应
- ascii字符集，计算机领域最早的字符集，共128个，现有的大多数的字符集都需要兼容ascii（A97，a65）
- unicode是目前应用最广、支持最多的字符集，世界各国语言都囊括了
- js中只支持unicode；写js的最佳实践是把字符限制在ascii范围内
- 从两个视角看unicode
  - blocks
    - basic latin（ascii的128个）
    - CJK（中文字符的两万多个）
    - BMP（四位十六进制位能表示的范围，基本字符平面
    - basic latin（ascii的128个）
  - categories
    - block与码数强相关，categories更多是功能上的分类

### js词法 -- inputElement
- whitespce
  - TAB/HT
  - VT
  - FF 分页符
  - SP
  - NBSP
    - no-break的sp，相比于sp，不会在这里断行。重点是处理排版
  - ZWNBSP/BOM
- lineTerminator
  - LF分页符：LF（line feed：换行）
  - CR表示换行符：CR（carriage return：回车）
  - LS分行符
  - PS分段符
- comment
  - 单行注释 //
  - 多行注释 /**/
- token
  - punctuation 符号
  - identifierName
    - identifier 标识符（变量名
    - keywords 关键字
    - future reserved keywords
  - literal 字面量

### js运行时 -- 类型
> 这里讲到type，这是运行时的东西
> number，string，Boolean，null，undefined，object，symbol
> 主要讲前面两个，特别地，讲一下正则字面量，虽然它不属于基本类型

  
####  Number
- IEEE 754 double float 
  - sign（1）符号位
  - exponent（11）指数部分-科学计数法的有效数
  - fraction (52) 精度部分
- number的语法
  - 整数语法
    - 十进制 12.3e10 (大E小e都可以，科学技术法)
    - 二进制 0b开头
    - 八进制 0o开头
    - 十六进制 0x开头
  - 小数
    - 小数点前后都可以省略
- 最佳实践
  - 安全整数范围
  `Number.MAX_SAFE_INTEGER.toString(16) // 1fffffffffffff `
  - 比较浮点数
  ```
  // Number.EPSILON 属性表示 1 与Number可表示的大于 1 的最小的浮点数之间的差值。
  Math.abs(0.1+0.2-0.3)<=Number.EPSILON // true
  ```

####  string：
- 字符集
  - ascii
  - unicode
  - UCS   U+0000 - U+FFFF （unicode的BMP范围
  - GB 国标，汉字
    - GB2312, GBK(GB13000), GB18030
  - ISO-8859 欧洲
  - BIG5，台湾，繁体
- encoding：
  - UTF
  - utf8，utf16
  - charCodeAt，codePointAt
- string语法：
  - 单引号
    - 里面可以写 \u转义（四位）和 \x转义（2位）
    - 可以被反斜杠转义的有  ' '' t n v b f r \ 
  - 双引号
  - 反引号
    - template字符串模板
  
####  正则表达式直接量
- 注意正则和除法的坑；能插除号就是除法；否则就是正则
- 这也是ecma标准的词法分类复杂的原因