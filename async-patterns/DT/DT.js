var Fiber = require('fibers'),
    _ = require('underscore'),
    util = require('util');

var DB = {
  1: {name: 'foo'},
  2: {name: 'bar'}
};

function query(ids) {
  var result = {};
  _.each(ids, function fetchById(id) {
    result[id] = DB[id] || null;
  });
  return result;
}

var DT = (function() {
  var _instances = {};
  var _DT = function(name) {
    if (!_.has(_instances, name)) {
      throw new Error('no DT instance: ' + name);
    }
    return _instances[name];
  };
  _DT.register = function(name, instance) {
    _instances[name] = instance;
  };
  _DT.dispatch = function() {
    _.each(_instances, function(instance, name) {
      console.log('DT dispatch: ', name);
      instance.dispatch();
    });
  };
  return _DT;
})();

// NOTE: need to implement cacheKey(id), fetch(ids)
function AbstractDataType() {
  this._cache = {};
  this._idsToFetch = {};
}
AbstractDataType.prototype.dispatch = function() {
  var ids = _.keys(this._idsToFetch);
  if (_.isEmpty(ids)) {
    return;
  }
  console.log('AbstractDataType dispatch: ', ids);
  var values = this.fetch(ids);
  this._idsToFetch = {};
  _.each(ids, function(id) {
    var key = this.cacheKey(id);
    this._cache[key] = values[id];
  }.bind(this));
  console.log(this._cache);
};
AbstractDataType.prototype.gen = function(ids) {
  var fiber = Fiber(function() {
    if (!(ids instanceof Array)) {
      ids = [ids];
    }
    console.log('gen: ', ids);
    _.each(ids, function(id) {
      this._idsToFetch[id] = true;
    }.bind(this));
    Fiber.yield(null);
    console.log('gen after fetch: ', ids);
    var objs = {};
    _.each(ids, function(id) {
      var key = this.cacheKey(id);
      objs[id] = this._cache[key];
    }.bind(this));
    Fiber.yield(result(objs));
  }.bind(this));
  return fiber;
};
/*
AbstractDataType.prototype.dirty = function(key) {
  delete this._cache[key];
};
*/

var ObjDataType = new AbstractDataType();
ObjDataType.cacheKey = function(id) {
  return 'objs:' + id;
};
ObjDataType.fetch = function(ids) {
  return query(ids);
};
DT.register('Obj', ObjDataType);

function Result(value) {
  this.value = value;
}

function wait(gen) {
  var parent = Fiber.current;
  Dispatcher.enqueue(gen, parent);
}

function waitv(/* gen1, ..., genN */) {
  var gens = Array.prototype.slice.call(arguments);
}

function result(value) {
  return new Result(value);
}

var App = Fiber(function App() {
  var user = Fiber.yield(wait(DT('Obj').gen(1)));
  console.log('user: ', user);
  //var users = Fiber.yield(wait(DT('Obj').gen([1, 2])));
  //console.log(users);
  Fiber.yield(result(user));
});

var Dispatcher = {
  _yielding: []
};
Dispatcher.dispatch = function() {
  DT.dispatch();
};
Dispatcher.enqueue = function(gen, parent) {
  this._yielding.push({
    gen: gen,
    parent: parent
  });
};
Dispatcher.run = function(root) {
  this.enqueue(root, null);
  while (!_.isEmpty(this._yielding)) {
    var currentPass = _.clone(this._yielding),
        blockedGens = _.uniq(_.pluck(currentPass, 'parent'));
    console.log(currentPass);
    this._yielding = [];
    // run all things that aren't blocked one step
    _.each(currentPass, function(entry) {
      if (_.contains(blockedGens, entry.gen)) {
        return;
      }
      var yielded = entry.gen.run();
      if (yielded instanceof Result) {
        console.log('result: ', yielded);
        if (entry.parent) {
          entry.parent.run(yielded.value);
        }
      } else {
        this.enqueue(entry.gen, entry.parent);
      }
    }.bind(this));
    this.dispatch();
  }
};

Fiber(function main() {
  Dispatcher.run(App);
}).run();
