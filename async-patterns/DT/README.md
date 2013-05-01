# Batched DB Fetching with node-fibers

This implements the `DataType` pattern in node.js using `node-fibers`. The
pattern has several components:

- `Dispatcher` is a fancy [trampoline](http://en.wikipedia.org/wiki/Coroutine)
  manager;
- `CallGraph` keeps track of generator dependencies as part of
  `Dispatcher`;
- `needsDispatch`, `wait`, and `waitv` act as hooks into the `Dispatcher`,
  enabling it to keep track of who is waiting on whom;
- `AbstractDataType` provides general facilities for combined cache/DB
  fetches and cache dirtying;
- specific `AbstractDataType` instances like `ObjDataType` provide the
  details of what to fetch from cache/DB;
- `DT` manages `AbstractDataType` instances, and provides a hook for
  calling `dispatch()` on each instance to fetch data.

The end result is a mechanism for codebase-wide request batching, with the
`AbstractDataType` instances collecting those different requests and waiting
until the `Dispatcher` signals a fetching round.

## Caveat

Until v8 (and therefore node.js) provides full support for Harmony-style
[generators](http://wiki.ecmascript.org/doku.php?id=harmony:generators), this
should be considered experimental.

## TODO

- `CallGraph` should clean up nodes as they are no longer needed, as these
  represent additional per-fiber overhead. (Alternatively, we could keep track
  of results in the `Dispatcher` in some intelligent manner.)
- Implement backend cache layer as further demonstration of the technique.
