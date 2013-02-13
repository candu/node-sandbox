(function () {
  'use strict';
  var x = 0, y = 2;
  function add(val1, val2) {
    return val1 + val2;
  }
  if (x === 0) {
    console.log('foo');
  }
  var z;
  for (var i = 0; i < 2; i++) {
    z = add(y, x + i);
  }
})();
