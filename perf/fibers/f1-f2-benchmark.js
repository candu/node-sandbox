var Fiber = require('Fibers');

function F1() {
  var fiber = Fiber(function() {
    Fiber.yield();
  });
  fiber.run();
  fiber.run();
}

function F2() {
  var buf = new Buffer(5);
  buf.write('hello');
  var buf2 = new Buffer(5);
  buf2.write('world');
}

function bench(f, n) {
  var start = new Date();
  for (var i = 0; i < n; i++) {
    f();
  }
  var end = new Date(),
      elapsed = end - start;
  console.log(elapsed + ' ms');
}

var ITERS = parseInt(process.argv[2], 10);
bench(F1, ITERS);
bench(F2, ITERS);
