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

Readable streams emit `data`, `end`, and `error` events. Writable streams
emit `drain` and `error` events. `data` says "there is data to read", whereas
`drain` says "there is space to write" (i.e. the downstream process has
cleared out enough data that you can write more).

## Buffers

Buffers are efficient byte arrays in node.js, similar to the typed array
mechanism supported by modern browsers. The closest analogue would be
C's `char*`.

# Chapter 10 - HTTP, HTTPS

In node.js, an HTTP server is really just an `EventEmitter`. I wrote a quick
server to test this out, and received the following events in sequence:

    $ node HTTPTest.js 
    connection!
    request!

So far, so good. What about `checkContinue`? I'm guessing that's sent for
especially large requests (maybe file uploads, etc.) that don't fit within
a packet. I can test this theory:

    $ yes > file
    # ^C after 1-2 seconds
    $ curl -F file=@file http://localhost:8080

and, sure enough, the `checkContinue` event is fired. I try to get `connect`:

    $ curl -X CONNECT http://localhost:8080
    curl: (52) Empty reply from server

but get `clientError` instead! I'm not sure how HTTP CONNECT is used, so
let's skip that for now. Same for `upgrade` - no idea what that means. In
practice, you'll mostly care about `request`.

You can also issue HTTP requests via `http.get()` or by crafting custom
requests with `http.request()`.

HTTPS requires a certificate and private key; once those are generated, we
can test `request`, `connection`, and `checkContinue` in exactly the same way
as for the HTTP server. (`curl` will require the `-k` flag to bypass its
version of the browser's untrusted certificate warning.)

# Chapter 11 - File system

The `fs` module provides utilities for file I/O. Actually, this module does
far more than that - you can access node-ified versions of most of the
standard UNIX filesystem-related system calls.

If you're looking for equivalents to Python's `os.path` utilities, check out
the [path module](http://nodejs.org/api/path.html). `os.path.join()`, for
instance, has counterpart `path.join()`:

    var filePath = require('path').join('foo', 'bar');

Again, you have `readFile()` for fully buffered reads and `read()` for
streaming reads, with `writeFile()` and `write()` for writes.

The main difficulty is in getting asynchronous I/O to do what you want.
There are considerations that don't exist in blocking code:

- Order of execution is not guaranteed. If you are performing dependent
  operations (e.g. create and write to a file only if it doesn't exist), you
  must ensure that the operations occur in order by using control flow
  techniques.
- Throttling must be performed explicitly: nothing will stop your I/O code
  from opening thousands of file descriptors in parallel.
