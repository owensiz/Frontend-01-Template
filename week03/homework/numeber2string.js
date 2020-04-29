// ==================================== String2Number
function convertStringToNumber(string, radix = 10) {
  // radix 表示进制，仅考虑11进制以下的，其他的需要abc这样的字母
  // convert to array
  let chars = string.split('');
  let i = 0;
  // 整数部分
  let number = 0;
  // 用while，因为代码是多段，可以体现思路和逻辑
  while (i < chars.length && chars[i] !== '.') {
    // carry bit 进位
    number = number * radix;
    number += chars[i].codePointAt(0) - '0'.codePointAt(0);
    i++;
  }
  if (chars[i] === '.') {
    i++;
  }
  // 小数部分
  let fractionRadix = 1;
  while (i < chars.length && chars[i] !== '.') {
    fractionRadix = fractionRadix * radix;
    number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) / fractionRadix;
    i++;
  }
  return number;
}
convertStringToNumber('10.0123');

// ==================================== Number2String
function convertNumberToString(number, radix = 10) {
  let integer = Math.floor(number);
  // 只考虑十进制的小数
  let fraction = (radix === 10 ? String(number).match(/\.\d*/)[0] : '');
  console.log(fraction);
  let string = '';
  // == integer part
  while (integer > 0) {
    // remind the direction!
    string = String(integer % radix) + string; // 余数逐渐往前排，条件是大于0
    integer = Math.floor(integer / radix);
  }
  console.log(2,string);
  return string + fraction;
}
convertNumberToString(101.0123);
convertNumberToString(101,2);
