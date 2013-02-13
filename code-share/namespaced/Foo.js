(function(exports) {
  var module = function(ns) {
    ns.lib = ns.lib || {};
    ns = ns.lib;
    var Foo = function(x) {
      var _x = x,
          that = {};
      that.incr = function() {
        _x++;
      };
      that.get = function() {
        return _x;
      }
      return that;
    };
    Foo.test = function() {
      var foo = Foo(3);
      foo.incr();
      console.log(foo.get());
    };
    ns.Foo = Foo;
  };
  try {
    module(my);
  } catch (err) {
    exports.__extend = module;
  }
})(this);
