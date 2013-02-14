var Future = require('fibers/future');

var wrap = function(fn, idx) {
  return Future.wrap(fn, idx);
};

var wait = function(future) {
  return future.wait();
};

var waitV = function(/* future1, ..., futureN */) {
  return waitA(Array.prototype.slice.call(arguments));
};

var waitA = function(futures) {
  Future.wait(futures);
  return futures.map(function(future) {
    return future.get();
  });
};

var waitO = function(futuresObj) {
  var keys = [],
      futures = [];
  for (var key in futuresObj) {
    if (futuresObj.hasOwnProperty(key)) {
      keys.push(key);
      futures.push(futuresObj[key]);
    }
  }
  Future.wait(futures);
  var results = {};
  for (var i = 0; i < keys.length; i++) {
    results[keys[i]] = futures[i].get();
  }
  return results;
};

module.exports = {
  wrap: wrap,
  wait: wait,
  waitV: waitV,
  waitA: waitA,
  waitO: waitO
};
