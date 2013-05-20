var SumService = require('gen-nodejs/SumService'),
    ttypes = require('gen-nodejs/SumService_types');

var thrift = require('thrift'),
    fibrous = require('fibrous');

var connection = thrift.createConnection('localhost', 9090),
    client = thrift.createClient(SumService, connection);

fibrous.run(function() {
  var N = parseInt(process.argv[2], 10);
  for (var i = 0; i < N; i++) {
    client.sync.add(1);
    console.log(process.argv[3], client.sync.get());
  }
}, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  connection.end();
  process.exit(0);
});
