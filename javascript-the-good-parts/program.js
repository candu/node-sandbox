Function.prototype.method = function(name, func) {
  if (!this.prototype[name]) {
    this.prototype[name] = func;
  }
  return this;
};

if (typeof Object.create !== 'function') {
  Object.create = function(o) {
    var F = function() {};
    F.prototype = o;
    return new F();
  };
}

Number.method('integer', function() {
  if (this < 0) {
    return Math.ceil(this);
  }
  return Math.floor(this);
});

String.method('trim', function() {
  return this.replace(/^\s+|\s+$/g, '');
});

Function.method('curry', function() {
  var args = Array.prototype.slice(arguments);
  return function() {
    return this.apply(null, args.concat(Array.slice(arguments)));
  }.bind(this);
});

var Memoized = function(f) {
  var _cache = {};
  return function(x) {
    if (_cache.hasOwnProperty(x)) {
      return _cache[x];
    }
    return _cache[x] = f.call(null, x);
  };
};

/*
var fibonacci = function (n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};
var start = new Date(); fibonacci(35); console.log(new Date() - start);
fibonacci = Memoized(fibonacci);
var start = new Date(); fibonacci(35); console.log(new Date() - start);
*/

Function.method('inherits', function(Parent) {
  this.prototype = new Parent();
  return this;
});

var mammal = function(spec) {
  var that = {};
  that.getName = function() {
    return spec.name;
  };
  that.says = function() {
    return spec.saying || '';
  };
  return that;
};

var cat = function(spec) {
  spec.saying = spec.saying || 'meow';
  var that = mammal(spec);
  that.purr = function(n) {
    var s = [];
    for (var i = 0; i < n; i++) s.push('r');
    return s.join('-');
  };
  that.getName = function() {
    var says = that.says();
    return [says, spec.name, says].join(' ');
  };
  return that;
};

var myMammal = mammal({name: 'Herb'});
var myCat = cat({name: 'Henrietta'});

Function.method('bind', function(context) {
  var that = this;
  return function() {
    return that.apply(context, arguments);
  };
});

Object.method('superior', function(name) {
  return this[name].bind(this);
});

var coolcat = function(spec) {
  var that = cat(spec),
      superGetName = that.superior('getName');
  that.getName = function() {
    return 'like ' + superGetName() + ' baby';
  };
  return that;
};

var myCoolCat = coolcat({name: 'Bix'});
console.log(myCoolCat.getName());
