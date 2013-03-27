var count = 0;
var fib1 = function() {
  if (fib1.runme) {
    var msg = fib1.mailbox.shift();
    if (msg[0] == "end") {
      fib1.runme = false;
    } else {
      process.nextTick(fib2);
    }
  }
};
fib1.runme = true;
fib1.mailbox = [];


var fib2 = function() {
  if (count++ < 100000) {
    fib1.mailbox.push(["Hello world"]);
    process.nextTick(fib1);
  } else {
    fib1.mailbox.push(["end"]);
    process.nextTick(fib1);
    fib2.runme = false;
  }
};
fib2.runme = true;

process.nextTick(fib2);