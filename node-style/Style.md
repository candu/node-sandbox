# Style Guidelines

I cribbed [this post](http://nodeguide.com/style.html), taking only the
parts I personally think are reasonable.

- Indentation: 2 spaces.
- Trailing semicolons: always.
- Trailing whitespace: never.
- Line length: 80 characters.
- Quotes: single, except for JSON.
- Braces: 1TBS. (0)
- Variable declarations: anywhere, one per line.
- Variable names: lowerCamelCase.
- Class names: UpperCamelCase.
- Constants: ALL\_UPPERCASE.
- Object/Array literals: trailing commas, unquoted keys where possible.
- Equality: ===/!==, not ==/!=.
- Return style: early return.
- Closures: give them names (1), don't nest.
- Callbacks: use node-style where possible. (2)
- `with`, `eval`: never.
- Setters: never.
- Getters: yes, as long as they have no side effects. (Think `const`.)
- EventEmitters: use them, but don't listen to intra-class events.

## (0)

Opening brace on same line:

    function foo() {
      doStuff();
    }

This reduces usage of vertical space.

## (1)

The preferred style is

    req.on('end', function onEnd() {
      console.log('winning');
    });

Note the explicit name `onEnd`, which will show up in stacktraces and make
your life easier.

## (2)

node-style callbacks use the first parameter as an optional error:

    db.widgets.fetchSome(function(err, widgets) {
      // do stuff
    });
