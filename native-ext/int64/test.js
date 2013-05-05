var Int64 = require('build/Release/Int64').Int64;

var x1 = new Int64(),
    x2 = new Int64(42),
    x3 = new Int64('1234567890abcdef');
console.log(x1.toString());
console.log(x2.toString());
console.log(x3.toString());
console.log(x3.high32().toString(16));
console.log(x3.low32().toString(16));

var y1 = new Int64(7),
    y2 = y1.shiftLeft(1),
    y3 = y1.shiftRight(1);
console.log(y2.toString());
console.log(y3.toString());

var z1 = new Int64(13),
    z2 = new Int64(7),
    z3 = z1.and(z2),
    z4 = z1.or(z2),
    z5 = z1.xor(z2);
console.log(z3.toString());
console.log(z4.toString());
console.log(z5.toString());

(function() {
  var x = new Int64('ffffffffffffffff');
  console.log(x.high32().toString(16));
  console.log(x.low32().toString(16));
})();

(function() {
  var a = new Int64(2),
      b = new Int64(3);
  console.log(a.equals(b));
  console.log(a.equals(a));
  console.log(a.compare(b));
  console.log(b.compare(a));
  console.log(a.compare(a));
})();
