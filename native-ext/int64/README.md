# int64-native

`int64-native` is a simple `uint64_t` wrapper for JavaScript, enabling the
use of 64-bit unsigned integers from node.

## Installing

### via npm

    npm install int64-native

### from source

    git clone git://github.com/candu/node-int64-native.git
    cd node-int64-native
    npm install

`int64-native` is built using `node-gyp`.

## Usage

### Including

`require()` gives you direct access to the constructor:

    var Int64 = require('int64-native');

### Constructor

You can create an `Int64` as follows:

    var x = new Int64(),                        // 0x0
        y = new Int64(42),                      // 0x2a
        z = new Int64(0xfedcba98, 0x76543210),  // 0xfedcba9876543210
        w = new Int64('fedcba9876543210');      // 0xfedcba9876543210

The last two methods allow you to represent `uint64_t` values larger than
`(1 << 53) - 1`.

### Type Conversions

`Int64` exposes `toNumber()`, `valueOf()` for converting to numeric values:

    var a = new Int64(2),
        b = new Int64(3);
    console.log(a + b);                         // 4

Values larger than `(1 << 53) - 1` will be converted to `Infinity`, since
they cannot be accurately represented using JavaScript's `Number` type.

`toString()` produces the hex string corresponding to an `Int64`:

    var x = new Int64('fedcba9876543210');
    console.log(x.toString());                  // 'fedcba9876543210'

### Comparison

For cases where you wish to sort or compare `Int64` values, `equals()` and
`compare()` are provided:

    var a = new Int64(2),
        b = new Int64(3);
    console.log(a.equals(a));                   // true
    console.log(a.equals(b));                   // false
    console.log(a.compare(a));                  // 0
    console.log(a.compare(b));                  // -1
    console.log(b.compare(a));                  // 1

### Bit-Twiddling

There are several operations for bit-level manipulation of `Int64` values:

    var x = new Int64('fedcba9876543210');
    console.log(x.high32().toString(16));       // 'fedcba98'
    console.log(x.low32().toString(16));        // '76543210'
    var y = x.and(0xffff),
        z = x.or(0xffff),
        w = x.xor(new Int64('fffffffffffffffff'));
    console.log(y.toString());                  // '0000000000003210'
    console.log(z.toString());                  // 'fedcba987654ffff'
    console.log(w.toString());                  // '0123456789abcdef'
