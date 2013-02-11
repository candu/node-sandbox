function async(arg, callback) {
  console.log('do something with "' + arg + '", return 0.1 sec later');
  setTimeout(function() {
    callback(arg * 2);
  }, 50 + 100 * Math.random());
}

function final(results) {
  console.log('Done', results);
}

function Series(items) {
  var _results = [],
      _pos = 0;
  var _nextCallback = function(result) {
    _results.push(result);
    _next();
  };
  var _next = function() {
    if (items.length === 0) {
      final(_results);
      return;
    }
    async(items.shift(), _nextCallback);
  };
  return { run: _next };
};

function Parallel(items) {
  var _results = [],
      _done = 0;
  var _callback = function(result) {
    _results.push(result);
    _done++;
    if (_done === items.length) {
      final(_results);
    }
  };
  var that = {};
  that.run = function() {
    while (items.length > 0) {
      async(items.shift(), _callback);
    }
  };
  return that;
};

function LimitedParallel(items, limit) {
  var _results = [],
      _done = 0;
  var _nextCallback = function(result) {
    _results.push(result);
    _next();
  };
  var _next = function() {
    if (items.length === 0) {
      _done++;
      if (_done === limit) {
        final(_results);
      }
      return;
    }
    async(items.shift(), _nextCallback);
  };
  var that = {};
  that.run = function() {
    for (var i = 0; i < limit; i++) {
      _next();
    }
  };
  return that;
};

var items = [1, 2, 3, 4, 5, 6];
switch (process.argv[2]) {
  case 'Series':
    Series(items).run();
    break;
  case 'Parallel':
    Parallel(items).run();
    break;
  case 'LimitedParallel':
    LimitedParallel(items, 2).run();
    break;
  default:
    console.log('unrecognized control flow type: ' + process.argv[2]);
}
