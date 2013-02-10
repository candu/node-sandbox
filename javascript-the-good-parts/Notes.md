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

Crockford also briefly mentions mixins at the end of Section 5, which he
calls "Parts".

# arrays

JavaScript arrays are not like arrays in other languages:

- Like (almost) everything else in JavaScript, they are objects. They
  do not use linear memory allocation.
- They rely on object property lookups, which are dog-slow compared to simple
  linear allocation lookups.
- Since the memory allocated is non-contiguous, there is no guarantee about
  being able to access sequential indices.

The last point is important: it's up to you to use arrays in an array-like
manner. Since property lookups for non-existent properties return
`undefined`, there is no error when you access indices out of bounds.

Deletion does *not* shift subsequent array elements over; you must use
`Array.prototype.splice()` for that.

If you're in an HTML5-compliant environment, you can use
[typed arrays](http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/) to
get the performance benefits of traditional arrays. In node.js, you can use
[Buffers](http://nodejs.org/api/buffer.html) for the same effect.

# methods

## formatting numbers

- `Number.prototype.toExponential(fractionDigits)`
- `Number.prototype.toFixed(fractionDigits)`
- `Number.prototype.toPrecision(precision)`
- `Number.prototype.toString(radix)`: note the `radix` argument!

## strings

- `String.prototype.localeCompare(that)`: not really useful, since the 
  sorting order isn't actually well-specified by the JavaScript spec.
- `String.prototype.search(regexp)`: `indexOf()` for regexes.
- `String.prototype.slice(start, end)`: like `substring()`, but `end` can
  be negative to offset from the end of the string! Use this instead of
  `substring()`.
- `String.fromCharCode(char, ...)`: build a string from raw character codes.

# style

Style is especially important in highly dynamic languages like JavaScript:
there are no safeguards to protect you if you pass garbage around! Like PHP,
there are many language "features" that pack a nasty bite.

## awful parts

Global variables are easy to declare:

    var foo = value;

Actually, you don't even need the `var` keyword:

    foo = value;

This produces an implied global, which in browser context is attached to
`window`. You can flag implied globals as errors in many browsers with
a simple

    'use strict';

at the top of your scripts; since it's just a string, browsers that don't
support it will ignore it.

Scope is function-level, not block-level. (I'm actually having a hard time
concocting a scenario where this bites you: if you've got an example, let me
know!)

Semicolons are implicitly added, turning

    return
    {
      status: true
    };

into

    return;
    {status: true}

which returns `undefined` and never gets to the object initialization.

Crockford claims that reserved words cannot be used with dot notation; in
Chrome at least, that isn't true. (Not sure what happens in other browsers.)

Unicode support is horribly broken: it relies on UTF-16 encoding rather than
UTF-8, with the result that characters above the Basic Multilingual Plane
must be represented with more than one character. (How often will you hit this
problem? No idea.)

`typeof`: don't use it. It causes pain:

    typeof null === 'object';
    typeof [] === 'object';
    typeof /a/ === 'object';    // on recent Chrome
    typeof NaN === 'number';

A more robust solution is to inspect `constructor`:

    function typeOf(value) {
      return value.constructor
        .toString()
        .split(' ')[1]
        .slice(0, -2)
        .toLowerCase();
    }
    typeOf([]) === 'array';
    typeOf(/\w+/) === 'regexp';

Yeah, that's a mouthful!

`parseInt(value, radix)` is broken if you don't explicitly set `radix`:

    parseInt('16') === 16
    parseInt('16 tons') === 16    // no way to know that there's extra stuff!
    // more recent implementations give 8, older ones give 0: octal!
    parseInt('08') === 0 || parseInt('08') === 8

Crockford doesn't mention this, but `radix` can bite you hard when used with
`Array.prototype.map()`:

    ["10", "10", "10", "10"].map(parseInt)

gives

    [10, NaN, 2, 3]

since `map()` is passing the array index as the `radix` parameter!

`+` works differently for numbers and strings. Most notably: if any
parameter is a string, all other parameters are coerced to strings and
concatenated:

    0 + 3 === 3
    '' + 3 === '3'
    undefined + 3 === NaN

Don't use `typeof NaN === 'number'`. Don't even use our
`typeOf(NaN) === number` from above: `NaN.constructor` is `Number()`, making
this approach useless! The only safe approach is `isNaN(NaN)`.

Falsy values are a pain, just like in PHP. Use `===` where possible with
explicit tests for `null`, `undefined`, and `false`. I usually use the
convention that `undefined` indicates non-existence, `null` indicates error,
and `false` is used only for boolean conditions.

You can apparently redefine `undefined` (heh), but Chrome is smart enough
to stop this.

`hasOwnProperty()` can be replaced. You shouldn't do this under any
circumstances, but unfortunately there's no good way to stop it from
happening. I guess you could limit damage with a hack like
  
    var HackGuard = function() {
      var that = {};
      var _original = Object.prototype.hasOwnProperty();
      that.init = function() {
        window.setInterval(function() {
          if (Object.prototype.hasOwnProperty !== _original)
        }, 10);
      };
      return that;
    };
    var guard = HackGuard();
    guard.init();

...but that seems like overkill, especially since someone sufficiently
dedicated would just rip out the interval and then replace `hasOwnProperty()`.

## bad parts

`==` and `!=` suck; use `===` and `!==`, which are type-safe. The suckiness
comes from type coercion, which rarely does what you want:

    false == '0'    // because false, '0' are both coerced to 0!

It can lead to intransitive equality when type coercion is not applied
consistently:

    '' == 0     // is true: '' is coerced to number
    0 == '0'    // is true: '0' is coerced to number
    '' == '0'   // is false: no type coercion is performed!

Note that this type coercion is different from that applied by `+`, which
likes strings for some reason.

`with` is a good idea in theory, but its interaction with function scoping
leads to disaster. Don't use it.

`eval` is evil. There isn't really a good reason to use it, especially with
JSON.parse() built into the language. Worse, there are other ways to
achieve `eval`-like behavior, all of which should be avoided:

- The constructor `Function()` can take a string argument and evaluate it;
  don't use it, and declare functions normally instead.
- `setTimeout()`, `setInterval()` can take string arguments and evaluate them;
  pass real functions instead.
- DOM event handlers specified in HTML (e.g. `onclick` attributes) can take
  strings and evaluate them; use JavaScript DOM bindings to attach event
  handlers where possible.

This last one is probably the least important: there are cases where you might
want to generate event-handling HTML elements server-side.

Crockford argues against `continue`, but I like to use it as an early-skip
in long loop bodies:

    for (var i = 0; i < arr.length; i++) {
      if (!test(arr[i])) {
        continue;
      }
      // do a lot of stuff...
    }

As in most languages, you are advised to avoid relying on the
fall-through behavior of `switch`: it creates hard-to-find bugs.

Crockford doesn't use `++` and `--` because of their potential to lead to
code like this:

    for (p = src, q = dest; !*p; p++, q++) *q = *p;

I think they have their place: to me, `x++` is easier to parse and write than
`x += 1`. That said, I only use them as standalone expressions, never in
this combination assignment-mutation manner.

JavaScript has bit-manipulation operators, but they have nowhere near the
efficiency of their C counterparts: they have to coerce floating-point
numbers to integers and back again.

The `function` statement is just syntactic sugar. These are equivalent:

  function foo() {}
  var foo = function foo() {};
  var foo = function() {};

Note that the variable `foo` hides the function `foo` in the second one:
the function is first created as `foo`, and then is immediately rebound to
`foo`.

Typed wrappers (`String`, `Boolean`, etc.) should be avoided, since you
can just create the values directly.

`new` is an anomaly, a weird attempt to get classical inheritance-like syntax
in a language that doesn't really support it. If you forget to use it, weird
stuff happens:

    var foo = function() { this.x = 42; console.log(this); };
    var f = new foo();    // OK, f.x === 42
    var g = foo();        // eek! this is either undefined or bound to window

With functional inheritance, `new` becomes unnecessary: you simply invoke
the function, and the returned object is your new instance.

`void` is weird. If you never knew it existed, maintain your ignorance. If
you're still curious:

    void(42) === undefined;
    void(false) === undefined;
    void('whatever') === undefined;

## jslint

JSLint enforces the following useful rules:

- No implicitly declared variables. All globals must use the `var` keyword.
- No missing or superfluous semicolons.
- No commas used as operators, except in `for` statements.
- No implicit blocks. All control structures must use `{}` braces to delimit
  their scope.
- No standalone blocks. They don't do anything, since all variables have
  function scope. (In C++, for instance, using smart pointers inside
  standalone blocks is an excellent memory management technique. Here, it
  is meaningless.)
- No `for (prop in obj) {}` constructs without an accompanying
  `hasOwnProperty()` check.
- No fall-through behavior on `switch`.
- No uses of `==` or `!=`. Use their type-safe counterparts `===` and `!==`.
- No use of `with`, `eval`, or `void`.

This list is not exhaustive, but it covers all the style conventions that
seem useful.
