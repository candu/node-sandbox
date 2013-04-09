define([], function() {
  var db = {};
  var Foo = {};
  Foo.getAll = function(req, res) {
    res.type('json');
    res.send(db);
  };
  return Foo;
});
