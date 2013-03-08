var pg = require('pg'),
    ArgumentParser = require('argparse').ArgumentParser,
    fibrous = require('fibrous'),
    util = require('util'),
    _ = require('underscore');

function Pool(connOptions, capacity) {
  this._connOptions = connOptions;
  this._capacity = capacity;
  this._size = 0;
  this._nextId = 0;
  this._availableClients = [];
  this._waitingQueue = [];
}
Pool.prototype.checkOut = function(callback) {
  if (this._size < this._capacity) {
    this._size++;
    console.log('creating new client: ' + this._size);
    var client = new pg.Client(this._connOptions),
        id = this._nextId++;
    try {
      client.connect();
      callback(null, client);
    } catch (err) {
      callback(err);
    }
    return;
  }
  if (this._availableClients.length === 0) {
    console.log('waiting on available client');
    this._waitingQueue.push(callback);
  } else {
    var client = this._availableClients.shift();
    callback(null, client);
  }
};
Pool.prototype.checkIn = function(client, callback) {
  if (this._waitingQueue.length > 0) {
    console.log('available client for waiter');
    var waitingCallback = this._waitingQueue.shift();
    waitingCallback(null, client);
  } else {
    this._availableClients.push(client);
  }
  callback(null, true);
};
Pool.prototype.query = function(query, callback) {
  var that = this;
  this.checkOut(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    client.query(query, function(err, result) {
      var anyError = err;
      that.checkIn(client, function(err, ok) {
        anyError = anyError || err;
        if (anyError) {
          callback(anyError);
          return;
        }
        console.log('got result!');
        callback(null, result);
      });
    });
  });
};

function parseArgs() {
  var parser = new ArgumentParser({addHelp: true});
  parser.addArgument(['-c', '--capacity'], {
    help: 'capacity of connection pool',
    type: Number,
    defaultValue: 10,
    dest: 'capacity'
  });
  parser.addArgument(['-n', '--numiters'], {
    help: 'number of iterations to run',
    type: Number,
    defaultValue: 100,
    dest: 'numiters'
  });
  return parser.parseArgs();
}

var args = parseArgs();
fibrous.run(function() {
  var capacity = args.capacity,
      n = args.numiters;
  var pool = new Pool({
    user: 'candu',
    database: 'node-sandbox'
  }, capacity);
  var futures = [];
  for (var i = 0; i < n; i++) {
    futures.push(pool.future.query('SELECT * FROM foo'));
  }
  return fibrous.wait(futures);
}, function(err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(_.pluck(results, 'rowCount')));
  }
  process.exit(0);
});
