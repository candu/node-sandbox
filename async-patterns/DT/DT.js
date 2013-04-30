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
  Dispatcher.wait(gen, parent);
}

function waitv(/* gen1, ..., genN */) {
  var parent = Fiber.current,
      gens = Array.prototype.slice.call(arguments);
  Dispatcher.waitv(gens, parent);
}

function result(value) {
  return new Result(value);
}

var App = Fiber(function App() {
  var user = Fiber.yield(wait(DT('Obj').gen(1)));
  console.log('user: ', user);
  /*
  var users = Fiber.yield(waitv(
    DT('Obj').gen(1),
    DT('Obj').gen(2)
  ));
  console.log(users);
  */
  Fiber.yield(result(user));
});

var Dispatcher = {
  _gens: [],
  _waits: {},
  _results: {}
};
Dispatcher.dispatch = function() {
  DT.dispatch();
};
Dispatcher._genId = function(gen) {
  if (!_.contains(this._gens, gen)) {
    this._gens.push(gen);
  }
  return _.indexOf(this._gens, gen);
};
Dispatcher._gen = function(genId) {
  return this._gens[genId];
};
Dispatcher._canProceed = function(genId) {
  var waitIds = this._waits[genId];
  if (!waitIds) {
    return true;
  }
  if (!(waitIds instanceof Array)) {
    waitIds = [waitIds];
  }
  return _.every(waitIds, function hasResult(waitId) {
    return _.has(this._results, waitId);
  }.bind(this));
};
Dispatcher._getSendValue = function(genId) {
  var waitIds = this._waits[genId];
  if (!(waitIds instanceof Array)) {
    return this._results[waitIds];
  }
  return _.map(waitIds, function fetchResult(waitId) {
    return this._results[waitId];
  });
};
Dispatcher.wait = function(gen, parent) {
  var genId = this._genId(gen),
      parentId = this._genId(parent);
  this._waits[parentId] = genId;
  var yielded = gen.run();
  if (yielded instanceof Result) {
    this._results[genId] = yielded.value;
  }
};
Dispatcher.waitv = function(gens, parent) {
  var genIds = _.map(gens, this._genId.bind(this)),
      parentId = this._genId(parent);
  this._waits[parentId] = genIds;
  _.each(gens, function(gen, i) {
    var genId = genIds[i],
        yielded = gen.run();
    if (yielded instanceof Result) {
      this._results[genId] = yielded.value;
    }
  });
};
Dispatcher.run = function(root) {
  this.wait(root, null);
  while (!_.isEmpty(this._waits)) {
    // first, determine which generators to run
    var toRun = {};
    _.each(this._waits, function(genIds, parentId) {
      if (!(genIds instanceof Array)) {
        genIds = [genIds];
      }
      _.each(genIds, function(genId) {
        if (this._canProceed(genId)) {
          toRun[genId] = this._getSendValue(genId);
        }
      }.bind(this));
    }.bind(this));
    // next, run each of those generators one step
    _.each(toRun, function(sent, genId) {
      var gen = this._gen(genId),
          yielded = gen.run(sent);
      if (yielded instanceof Result) {
        console.log('result: ', yielded);
        this._results[genId] = yielded.value;
        delete this._waits[genId];
      }
    }.bind(this));
    // finally, dispatch to backend data fetchers
    this.dispatch();
  }
};

// TODO: when do you delete entries in this._waits?
//
// a generator has finished running when it results a result. that is it.

Fiber(function main() {
  Dispatcher.run(App);
}).run();
