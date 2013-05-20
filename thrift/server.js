var SumService = require('gen-nodejs/SumService'),
    ttypes = require('gen-nodejs/SumService_types');

var thrift = require('thrift'),
    fibrous = require('fibrous');

var s = 0;

function add(x) {
  s += x;
}

function get() {
  return s;
}

var server = thrift.createServer(SumService, {
  add: fibrous(add),
  get: fibrous(get)
});

server.listen(9090);
