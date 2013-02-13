# Client-Server JavaScript Code Sharing

Much has been written about client-server code sharing in a node.js stack.
It's actually quite easy; this directory contains examples of different
methods.

## require.js

To replicate this, you'll need client and server require.js builds:

    $ curl -O http://requirejs.org/docs/release/2.1.4/minified/require.js
    $ curl -O http://requirejs.org/docs/release/2.1.4/r.js

This takes a minor bit of server-side config to set up require.js, but
otherwise is quite easy.

## Anonymous Scopes

This is, I feel, a much cleaner way of achieving the same goals: you simply
use the pattern

    (function(exports) {
      // initialize stuff here, setting exports properties as you
      // would in node.js
    })(this);

and it works. In the browser, `this === window`, so the effect is
like a top-level `var`. In node.js, `this === module.exports`, so the effect
is like `exports.foo = bar`. Note that there's a bit of a syntax difference
in usage: client-side does

    Foo.test()

since `Foo` is now global, whereas server-side must do

    require('Foo').Foo.test()

since `module.exports` isn't being completely overridden.

## Namespaces with Anonymous Scopes

Yes, node.js already does namespacing through its `require()` mechanism.
That said, what if you want to use a top-level namespacing idiom? And what if
you want to use it both client-side and server-side?

I've got a hack, but it's not exactly pretty. Assume you have a top-level
namespace `my`; then, you use the pattern

    (function(exports) {
      var module = function(ns) {
        // initialize stuff here, setting ns properties
      };
      try {
        module(my);
      } catch (err) {
        exports.__extend = module;
      }
    })(this);

On server-side, you also have to use this special `__extend` method and
declare your namespace explicitly everywhere you want to set it up:

    var my = {};
    require('Foo').__extend(my);
    my.Foo.test();

It's not awful, but it's clunky enough to give pause. If you don't care about
server-side top-level namespacing - and why would you, when you have
`require()`? - you can alter the `try` block:

    try {
      module(my);
    } catch (err) {
      module(exports);
    }

With that, you can do

    require('Foo').Foo.test();

as before. This still suffers from double-layered anonymous scoping,
however.
