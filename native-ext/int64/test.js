var Int64 = require('build/Release/Int64').Int64;

var x1 = new Int64(),
    x2 = new Int64(42),
    x3 = new Int64('1234567890abcdef');
console.log(x1.toString());
console.log(x2.toString());
console.log(x3.toString());
console.log(x3.high32().toString(16));
console.log(x3.low32().toString(16));

var y1 = new Int64(3),
    y2 = y1.shiftLeft(1);
console.log(y2.toString());
