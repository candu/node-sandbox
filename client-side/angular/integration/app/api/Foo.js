define(['underscore'], function(_) {
  var db = {
    1: {id: 1, name: 'bar', age: 42},
    2: {id: 2, name: 'quux', age: 666}
  };
  var Foo = {};
  Foo.getAll = function(req, res) {
    res.type('json');
    res.send(db);
  };
  Foo.get = function(req, res) {
    if (!_.has(db, req.params.id)) {
      return null;
    }
    res.type('json');
    res.send(db[req.params.id]);
  };
  return Foo;
});
