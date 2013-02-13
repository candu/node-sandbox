var requirejs = require('./r');
requirejs.config({
  nodeRequire: require
});
requirejs(['Foo'], function(Foo) {
  Foo.test();
});
