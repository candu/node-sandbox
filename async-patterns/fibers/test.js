var Future = require('fibers/future'),
    should = require('should');

var wrap = function(fn, idx) {
  return Future.wrap(fn, idx);
};

var wait = function(future) {
  return future.wait();
};

var waitv = function(/* future1, ..., futureN */) {
  return waita(Array.prototype.slice.call(arguments));
};

var waita = function(futures) {
  Future.wait(futures);
  return futures.map(function(future) {
    return future.get();
  });
};

var waito = function(futuresObj) {
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

var sleep = function(ms, value) {
  var future = new Future();
  setTimeout(function() {
    future.return(value);
  }, ms);
  return future;
};

describe('wait', function() {
  it('works', function(done) {
    var f = function() {
      return wait(sleep(10, 42));
    };
    var ff = f.future();
    ff().resolve(function(err, result) {
      if (err) {
        done(err);
        return;
      }
      should.exist(result);
      result.should.equal(42);
      done();
    });
  });
  it('works in variadic mode', function(done) {
    var f = function() {
      return waitv(sleep(30, 1), sleep(20, 2), sleep(10, 3));
    };
    var ff = f.future();
    ff().resolve(function(err, result) {
      if (err) {
        done(err);
        return;
      }
      should.exist(result);
      result.should.be.an.instanceOf(Array);
      for (var i = 0; i < 3; i++) {
        result[i].should.equal(i + 1);
      }
      done();
    });
  });
  it('works in array mode', function(done) {
    var f = function() {
      return waita([sleep(30, 1), sleep(20, 2), sleep(10, 3)]);
    };
    var ff = f.future();
    ff().resolve(function(err, result) {
      if (err) {
        done(err);
        return;
      }
      should.exist(result);
      result.should.be.an.instanceOf(Array);
      for (var i = 0; i < 3; i++) {
        result[i].should.equal(i + 1);
      }
      done();
    });
  });
  it('works in object mode', function(done) {
    var f = function() {
      return waito({
        a: sleep(30, 1),
        b: sleep(20, 2),
        c: sleep(10, 3)
      });
    };
    var ff = f.future();
    ff().resolve(function(err, result) {
      if (err) {
        done(err);
        return;
      }
      should.exist(result);
      result.should.be.an.instanceOf(Object);
      result.a.should.equal(1);
      result.b.should.equal(2);
      result.c.should.equal(3);
      done();
    });
  });
});
