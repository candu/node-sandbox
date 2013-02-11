var EventEmitter = require('events').EventEmitter,
    util = require('util');

var MyEmitter = function(times) {
  var _interval = null,
      _done = 0,
      that = Object.create(EventEmitter.prototype);
  EventEmitter.call(that);
  var _tick = function() {
    _done++;
    that.emit('tick', _done);
    if (_done === times) {
      clearInterval(_interval);
      _interval = null;
    }
  };
  that.run = function() {
    _interval = setInterval(_tick, 100);
  };
  return that;
};

var emitter = MyEmitter(parseInt(process.argv[2]));
emitter.on('tick', function(i) {
  console.log('tick ' + i);
});
emitter.run();
