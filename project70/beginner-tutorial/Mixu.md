# Chapter 9 - Node Fundamentals

Building blocks:

- Streams for I/O;
- Buffers for data (really just an efficient array mechanism, like you
  find in languages such as C);
- Events for passing data between asynchronous tasks;
- Timers for delayed or repeated code execution (using the same
  `setTimeout()`, `setInterval()` mechanisms from browser JavaScript);
- C/C++ addons (really just extensions via node bindings, used for things
  that require super-high-performance)

## Timers

Same API as in browser JavaScript: timeouts for delayed execution, intervals
for repeated execution.

As Crockford says, don't pass string arguments to `setTimeout()` and its ilk;
those have to be `eval()`'d, which is unsafe and slow.

Remember that node.js is *single-threaded*: if you block the event loop with
a CPU-intensive callback, your callbacks will miss their scheduled timings
and run late (or not at all!)

## EventEmitter

Many browser JavaScript libraries have some variant of event listening:

    elem.addEvent('click', function(evt) {
      console.log('I was clicked!');
    });

Every DOM node can emit events, and you can bind callbacks as event listeners
on specific DOM nodes. In node.js, there are no DOM nodes; we need something
else to emit events! Enter `EventEmitter`.

In node.js, `EventEmitter` is essentially a glorified multimap between
event names and listeners. Notably, `EventEmitter` *does not guarantee
asynchronous execution!* When an Event is fired, something like this will
happen:

    for (var listener in this._events[eventName]) {
      listener.apply(null, args);
    }

It is up to each `listener` to provide an asynchronous implementation so that
this won't block the event loop.

## Streams

Methods like `readFileSync()`, `readFile()` are memory hogs: like Python's
`file.read()`, they read *everything* into memory in one large chunk.
`readSync()`, `read()` do streaming I/O, exposing data a bit at a time.
There are streaming methods for file, HTTP, TCP socket, and inter-process I/O.