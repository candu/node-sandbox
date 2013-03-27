var Fiber = require("fibers");

var count = 0;
var fib1 = Fiber(function() {
  var runme = true;
  while (runme) {
    Fiber.yield();
    var msg = fib1.mailbox.shift();
    if (msg[0] == "end") {
      runme = false;
    } else {
      fib2.run();
    }
  }
});
fib1.mailbox = [];


var fib2 = Fiber(function() {
  var runme = true;
  while (runme) {
    if (count++ < 100000) {
      fib1.mailbox.push(["Hello world"]);
      process.nextTick(function() {
        fib1.run();
      });
    } else {
      fib1.mailbox.push(["end"]);
      process.nextTick(function() {
        fib1.run();
      });
      runme = false;
    }
    Fiber.yield();

  }
});

fib1.run();
fib2.run();
