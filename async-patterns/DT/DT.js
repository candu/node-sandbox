var Fiber = require('fibers'),
    _ = require('underscore'),
    util = require('util');

var DB = {
  _nextId: 3,
  1: {name: 'foo'},
  2: {name: 'bar'}
};

function query(ids) {
  console.log('query:', ids);
  var result = {};
  _.each(ids, function fetchById(id) {
    result[id] = null;
    if (_.has(DB, id)) {
      result[id] = _.clone(DB[id]);
    }
  });
  return result;
}

function insert(name) {
  var id = DB._nextId++;
  DB[id] = {name: name};
  return id;
}

function update(id, name) {
  if (!_.has(DB, id)) {
    throw new Error('missing id: ' + id);
  }
  DB[id].name = name;
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
  var ids = _.filter(_.keys(this._idsToFetch), function(id) {
    var key = this.cacheKey(id);
    return !_.has(this._cache, key);
  }.bind(this));
  this._idsToFetch = {};
  if (_.isEmpty(ids)) {
    return;
  }
  console.log('AbstractDataType dispatch: ', ids);
  var values = this.fetch(ids);
  _.each(ids, function(id) {
    var key = this.cacheKey(id);
    this._cache[key] = values[id];
  }.bind(this));
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
    Fiber.yield(needDispatch());
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
AbstractDataType.prototype.dirty = function(id) {
  var key = this.cacheKey(id);
  delete this._cache[key];
};

var ObjDataType = new AbstractDataType();
ObjDataType.cacheKey = function(id) {
  return 'objs:' + id;
};
ObjDataType.fetch = function(ids) {
  return query(ids);
};
DT.register('Obj', ObjDataType);

var ObjMutator = {};
ObjMutator.create = function(name) {
  var fiber = Fiber(function() {
    Fiber.yield(result(insert(name)));
  });
  return fiber;
};
ObjMutator.setName = function(id, name) {
  var fiber = Fiber(function() {
    update(id, name);
    DT('Obj').dirty(id);
    Fiber.yield(result(null));
  });
  return fiber;
};

function Result(value) {
  this.value = value;
}

function needDispatch() {
  console.log('needDispatch');
  var gen = Fiber.current;
  Dispatcher.wait(gen, null);
}

function wait(waitGen) {
  var gen = Fiber.current;
  Dispatcher.wait(gen, waitGen);
}

function waitv(/* waitGen1, ..., waitGenN */) {
  var gen = Fiber.current,
      waitGens = Array.prototype.slice.call(arguments);
  Dispatcher.wait(gen, waitGens);
}

function result(value) {
  return new Result(value);
}

var App = Fiber(function App() {
  var user = Fiber.yield(wait(DT('Obj').gen(1)));
  console.log('user: ', user);
  var users = Fiber.yield(waitv(
    DT('Obj').gen(1),
    DT('Obj').gen(2)
  ));
  console.log('users: ', users);
  Fiber.yield(wait(ObjMutator.setName(1, 'baz')));
  users = Fiber.yield(waitv(
    DT('Obj').gen(1),
    DT('Obj').gen(2)
  ));
  console.log('users: ', users);
  var userId = Fiber.yield(wait(ObjMutator.create('frob')));
  user = Fiber.yield(wait(DT('Obj').gen(userId)));
  console.log('user: ', user);
  Fiber.yield(result('w00t'));
});

var NodeType = {
  LEAF: 1,
  WAIT: 2,
  WAITV: 3
};

function CallGraphNode(id, waitIds) {
  this._id = id;
  this._waitIds = {};
  if (waitIds === null) {
    this._type = NodeType.LEAF;
  } else if (!(waitIds instanceof Array)) {
    this._type = NodeType.WAIT;
    this._waitIds[waitIds] = true;
  } else {
    this._type = NodeType.WAITV;
    _.each(waitIds, function(waitId) {
      this._waitIds[waitId] = true;
    }.bind(this));
  }
  this._result = null;
  this._hasResult = false;
}
CallGraphNode.prototype.type = function() {
  return this._type;
};
CallGraphNode.prototype.waitIds = function() {
  return _.keys(this._waitIds);
};
CallGraphNode.prototype.setResult = function(result) {
  this._result = result;
  this._hasResult = true;
};
CallGraphNode.prototype.hasResult = function() {
  return this._hasResult;
};
CallGraphNode.prototype.result = function() {
  return this._result;
};

function CallGraph() {
  this._gens = [];
  this._nodes = {};
  this._result = null;
  this._hasResult = false;
}
CallGraph.prototype.id = function(gen) {
  var genId = _.indexOf(this._gens, gen);
  if (genId !== -1) {
    return genId;
  }
  genId = this._gens.length;
  this._gens.push(gen);
  this.setNode(gen, null);
  return genId;
};
CallGraph.prototype.gen = function(genId) {
  return this._gens[genId];
};
CallGraph.prototype.setNode = function(gen, waitGens) {
  var genId = this.id(gen);
  this._nodes[genId] = new CallGraphNode(genId, null);
  if (waitGens === null) {
    this._nodes[genId] = new CallGraphNode(genId, waitGens);
  } else if (!(waitGens instanceof Array)) {
    var waitId = this.id(waitGens);
    this._nodes[genId] = new CallGraphNode(genId, waitId);
  } else {
    var waitIds = _.map(waitGens, this.id.bind(this));
    this._nodes[genId] = new CallGraphNode(genId, waitIds);
  }
};
CallGraph.prototype.setResult = function(gen, result) {
  var genId = this.id(gen);
  this._nodes[genId].setResult(result);
};
CallGraph.prototype.hasResult = function(gen) {
  var genId = this.id(gen);
  return this._nodes[genId].hasResult(result);
};
CallGraph.prototype.result = function(gen) {
  var genId = this.id(gen);
  return this._nodes[genId].result(result);
};
CallGraph.prototype.getRunnableIds = function() {
  var runnableIds = {};
  _.each(this._nodes, function(node, genId) {
    var waitIds = node.waitIds();
    var waitGensFinished = _.every(waitIds, function(waitId) {
      return this._nodes[waitId].hasResult();
    }.bind(this));
    if (waitGensFinished && !node.hasResult()) {
      runnableIds[genId] = true;
    }
  }.bind(this));
  console.log('runnableIds:', runnableIds);
  return _.keys(runnableIds);
};
CallGraph.prototype.getSendValue = function(gen) {
  console.log('getSendValue:', gen);
  var genId = this.id(gen),
      node = this._nodes[genId],
      waitIds = node.waitIds();
  if (node.type() === NodeType.WAIT) {
    var waitNode = this._nodes[waitIds[0]];
    return waitNode.result();
  }
  return _.map(waitIds, function(waitId) {
    var waitNode = this._nodes[waitId];
    return waitNode.result();
  }.bind(this));
};
CallGraph.prototype.isTrivial = function() {
  return _.size(this._nodes) === 1;
};

var Dispatcher = {
  _graph: new CallGraph()
};
Dispatcher.dispatch = function() {
  DT.dispatch();
};
Dispatcher.runOneStep = function(gen, sendValue) {
  var yielded = gen.run(sendValue);
  if (yielded instanceof Result) {
    console.log('result: ', yielded);
    this._graph.setResult(gen, yielded.value);
  }
};
Dispatcher.wait = function(gen, waitGens) {
  this._graph.setNode(gen, waitGens);
  if (waitGens === null) {
  } else if (!(waitGens instanceof Array)) {
    this.runOneStep(waitGens);
  } else {
    _.each(waitGens, function(waitGen) {
      this.runOneStep(waitGen);
    }.bind(this));
  }
};
Dispatcher.run = function(root) {
  this.wait(Fiber.current, root);
  while (!this._graph.hasResult(Fiber.current)) {
    // first, dispatch
    this.dispatch();
    // next, run generators
    var runnable = this._graph.getRunnableIds();
    console.log('runnable:', runnable);
    _.each(runnable, function(genId) {
      console.log('genId:', genId);
      var gen = this._graph.gen(genId),
          sendValue = this._graph.getSendValue(gen);
      if (gen === Fiber.current) {
        this._graph.setResult(gen, sendValue);
      } else {
        this.runOneStep(gen, sendValue);
      }
    }.bind(this));
  }
  return this._graph.result(Fiber.current);
};

Fiber(function main() {
  var result = Dispatcher.run(App);
  console.log(result);
}).run();
