var pg = require('pg'),
    ArgumentParser = require('argparse').ArgumentParser,
    fibrous = require('fibrous'),
    util = require('util'),
    _ = require('underscore');

function parseArgs() {
  var parser = new ArgumentParser({addHelp: true});
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
  var n = args.numiters,
      results = [];
  for (var i = 0; i < n; i++) {
    var client = new pg.Client({
      user: 'candu',
      database: 'node-sandbox'
    });
    client.connect();
    results.push(client.sync.query('SELECT * FROM foo'));
    client.end();
  }
  return results;
}, function(err, results) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(_.pluck(results, 'rowCount')));
  }
  process.exit(0);
});
