# extending http

`express.createServer()` extends `connect.createServer()` to add views,
routing, and a couple of other trinkets. `connect.createServer()` extends
`http.createServer()` to add easily configurable middleware.

(Actually, you just do `app = express()` now, but the idea is the same.)

In functional languages, this kind of "ok, we're going to make this do one
more thing" monkey-patching is dead simple. In fact, there are two levels
of this going on here:

1. The meta-level `express` over `connect` over `http` level; and
2. The ground-floor `app.use()` level.

Middleware is just that: you're inserting a function that does one thing more.
In practice, this looks like

    function noopMiddleware(req, res, next) {
      next();
    }

Here, `next` is managed by `connect` in a way that reminds me of the series
control flow pattern.
