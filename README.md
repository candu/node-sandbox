# node-sandbox

is a git repo for playing around with various things related to
JavaScript/node.js.

## modules used

### core

- `fs`: filesystem stuff - system calls, file I/O with streaming/non-streaming
  and sync/async versions.
- `path`: utilities for manipulating filepaths (think `os.path.join()` from
  Python!)
- `http`: HTTP server/client library.
- `https`: the HTTPS counterpart to `http`.
- `crypto`: secure hashing and other cryptographic utilities.
- `util`: miscellaneous utilities, like `util.format()` for `printf()`-like
  formatting.
- `events`: `EventEmitter` and other events-related utilities.
- `url`: utilities for URL and query string parsing.

### community

- `express`: thin layer over `connect`, which itself is a thin middleware
  layer over `http`.
- `connect-mongo`: session persistence middleware, using MongoDB as a backing
  store.
- `stylus`: transpiled syntactic sugar for CSS, used for cleaner stylesheets
  in `express`.
- `mongodb`: the native node.js MongoDB library.
- `mongoose`: ODM layer over `mongodb`.
- `underscore`: utility function library, for easier Array/Object
  manipulation.
- `node-uuid`: generates UUIDs. Useful for salted hashed password mechanisms.
- `should`: BDD testing toolkit for making tests more readable using a
  chained property lookup syntax like `n.should.equal(42)`.
- `supertest`: testing toolkit for making requests against a server
  created with `http.createServer()`. Useful for API testing.
- `async`: simple utilities for async control flow, mapping, etc.
- `socket.io`: two-way client-server communication made easy.
