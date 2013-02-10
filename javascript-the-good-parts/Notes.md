# reserved words

I tried this, and to my surprise

    o = {var: 3};
    o = {}; o.var = 3;

both work despite `var` being a reserved word.

# numbers

Numbers are *all* 64-bit floating point; there are no integers. This means
that, e.g.,

    3 / 2 === 1.5
    Math.pow(2, 53) === 9007199254740992

However, some of the traditional bitwise operations will only function in
a strange 32-bit-like manner:

    1 << 31 === -2147483648
    1 << 32 === 1
    Math.pow(2, 31) & Math.pow(2, 31) === -2147483648
    Math.pow(2, 32) & Math.pow(2, 32) === 0

# types

Primitives are numbers (floating-point, including Infinity), strings, booleans,
null, undefined. Unlike objects, these are immutable.

# prototypes

`a.b` is resolved as follows:

- Does `a` have its own property `b`? (This can be checked with
  `hasOwnProperty()`.)
- If not, does `a.prototype` have property `b`?
- If not, does `a.prototype.prototype` have property `b`?
- ...
- If not, does `Object.prototype` have property `b`?
- If not, return undefined.

This can be written as follows:

    function getProperty(obj, prop) {
      // Object.prototype.prototype === undefined
      if (obj === undefined) {
        return undefined;
      }
      // hasOwnProperty() does *not* traverse the prototype chain
      if (obj.hasOwnProperty(prop)) {
        return obj[prop];
      }
      return getProperty(obj.prototype, prop);
    }

Note that if we do `obj.prototype.foo = 42`, *all* objects that have the
same prototype will instantly have `foo` in their prototype chain.

Consider the following code:
    
    var props = [];
    for (var prop in obj) {
      props.push(prop);
    }

The order of property names in `props` is not well-defined, and should not
be depended on.

## a note about Function

Note that `Function.prototype.prototype === Object.prototype`. I think
`new` does something like this (or would, if it were a function instead
of a keyword):

    function new(f) {
      var o = {};                 // 1. create an object
      o.prototype = f.prototype;  // 2. make it an instance of f
      f.bind(o)();                // 3. attach any instance variables
      return o;
    }

Any "constructor" arguments would be passed in step 3. Note that I'm
assuming the existence of `bind`, which is usually (IIRC) a thin wrapper
around `Function.prototype.apply`.

Actually, the book does provide an implementation:

    Function.method('new', function() {
      var that = Object.create(this.prototype);   // 1., 2.
      var other = this.apply(that, arguments);    // 3. (without bind)

      // Some constructors will mutate this but forget to return it...
      return (typeof other === 'object' && other) || that;
    });

Note the similarities: `Object.create()` is shorthand for the first two steps,
and `apply()` provides a terse implementation of `bind()`.

# globals

The recommended namespacing approach is to use a single global variable, then
attach "submodules" as properties on that variable:

    var namespace = {};
    namespace.moduleFoo = {
      bar: function(baz) {
        console.log(baz);
      }
    };

# functions

I knew this already, but for good measure: you can pass any number and type
of arguments to a function. No type checking is performed. Parameters with
names but no corresponding argument get the value `undefined`.

Recursive functions do not use tail recursion optimization.

Variables have function scope. Crockford recommends declaring all variables
at the top of a function for this reason, but I find that it can sometimes
be useful to do this:

    function foo() {
      var temp = getResult();
      // do something with temp
      var temp = getResult();
      // do something with temp
    }

as opposed to having to declare, e.g., `temp1`, ..., `tempN` for this
purpose.

## object specifiers

This is a standard "trick" for dealing with functions that have many
parameters. Instead of specifying parameters in linear fashion:

    function maker(f, l, m, c, s) {}

An object is provided instead:

    Object.merge = function(o1, o2) {
      for (var key in o2) {
        if (o2.hasOwnProperty(key)) {
          o1[key] = o2[key];
        }
      }
      return o1;
    };
    function maker(opts) {
      Object.merge(opts, {
        f: 'foo',
        l: 42,
        m: null,
        c: /\w+/,
        s: Infinity
      });
    }

This creates a cleaner signature and makes it much easier to specify
defaults. However, this can make code less readable, as you have to scan
the function body to determine what parameters it has.

This seems like a tradeoff that should only be made for functions with many
optional parameters.

# exceptions

Not sure why he throws an object: you can use the built-in `Error` and
other such classes. I guess the advantage is being able to check exception
type via `e.name === 'TypeError'` rather than with `e instanceof TypeError`.

# closures

Closures can help maintain encapsulation:

    var Counter = function(init) {
      var _value = init || 0;
      return {
        incr: function(inc) {
          _value += (inc || 1);
        },
        get: function() {
          return _value;
        }
      };
    };
    var myCounter = Counter(42);

Here `_value` is effectively private; the member closures `incr`, `get`
can access it, but external code cannot. Also, `_value` can use `init`, so
we can also use this as a constructor-with-arguments pattern.

# functional inheritance

This is considered the best pattern for object-oriented programming in
JavaScript. It provides *encapsulation*, in that variables and methods can
be kept private within a class scope. (Note that we're using JavaScript's
function scoping together with closures to enforce privacy!)
