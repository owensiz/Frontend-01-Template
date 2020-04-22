# 编写带括号的四则运算产生式
  
```
// 基础数字0-9
<BasicNumber> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

// 十进制数字，不允许以0开头 
<DecimalNumber> ::= "0" | ("1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" <BasicNumber>*)

// 括号运算
<PrimaryExpression> ::= <DecimalNumber> | "(" <LogicalExpression> ")"

// 乘法（除法）
<Multiplication> ::= <PrimaryExpression> | 
  <Multiplication> "*" <PrimaryExpression> | 
  <Multiplication> "*" <PrimaryExpression>

// 加法（减法）
// 鉴于乘除的优先级高于加减，可以认为加法是由若干个乘法再由加号或者减号连接成的
<Addition> ::= <Multiplication> | 
  <Addition> "+" <Multiplication> | 
  <Addition> "-" <Multiplication>

// 逻辑运算：加入了或和且
<LogicalExpression> ::= <Addition> | 
  <LogicalExpression> "||" <Addition> | 
  <LogicalExpression> "&&" <Addition>

```

# 尽可能寻找你知道的计算机语言，尝试把它们分类
- js：1型文法，动态语言，动态类型系统，弱类型
- python：0型文法，动态语言，静态类型系统
- c：静态语言，静态类型系统
- c++：0型文法，静态语言，静态类型系统，弱类型