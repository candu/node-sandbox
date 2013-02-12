var http = require('http'),
    url = require('url'),
    _ = require('../../lib/underscore');

var midgard = function() {
  var _mids = [],
      _gets = {},
      server = http.createServer();

  var _handleRequest = function(req, res) {
    var matchingHandler = _.find(_gets, function(handler, route) {
      var pathname = url.parse(req.url).pathname;
      console.log('request for URL: ' + pathname);
      return pathname === route;
    });
    if (_.isUndefined(matchingHandler)) {
      res.statusCode = 404;
      res.write('HTTP 404 Not Found: ' + req.url);
      res.end();
    } else {
      matchingHandler(req, res);
    }
  };
  var _makeNext = function(req, res, next, i) {
    return function(error) {
      if (!_.isUndefined(error)) {
        console.log('error!');
        res.statusCode = 500;
        res.write('HTTP 500 Internal Server Error: ' + error);
        res.end();
      } else {
        console.log('executing middleware ' + i);
        _mids[i](req, res, next);
      }
    };
  };

  server.use = function(mid) {
    _mids.push(mid);
  };
  server.get = function(route, handler) {
    _gets[route] = handler;
  };
  server.on('request', function(req, res) {
    console.log('request received');
    if (_mids.length === 0) {
      console.log('no middleware, passing through');
      _handleRequest(req, res);
      return;
    }
    var next = function(error) {
      if (!_.isUndefined(error)) {
        console.log('error!');
        res.statusCode = 500;
        res.write('HTTP 500 Internal Server Error: ' + error);
        res.end();
      } else {
        _handleRequest(req, res);
      }
    };
    for (var i = _mids.length - 1; i >= 0; i--) {
      next = _makeNext(req, res, next, i);
    }
    next();
  });
  return server;
};

module.exports = midgard;
