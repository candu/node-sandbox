var Gen = require('./gen'),
    Future = require('fibers/future'),
    should = require('should');

var sleep = function(ms, value) {
  var future = new Future();
  setTimeout(function() {
    future.return(value);
  }, ms);
  return future;
};

describe('Gen.wait', function() {
  it('works', function(done) {
    var f = function() {
      return Gen.wait(sleep(10, 42));
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
      return Gen.waitV(sleep(30, 1), sleep(20, 2), sleep(10, 3));
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
      return Gen.waitA([sleep(30, 1), sleep(20, 2), sleep(10, 3)]);
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
      return Gen.waitO({
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
