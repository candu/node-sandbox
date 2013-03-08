var pg = require('pg'),
    fibrous = require('fibrous'),
    util = require('util');

fibrous.run(function() {
  var client = new pg.Client({
    user: 'candu',
    database: 'node-sandbox'
  });
  client.connect();
  var args = process.argv.slice(2),
      i = 0,
      inserted = 0;
  while (i < args.length - 2) {
    var n = parseInt(args[i++], 10),
        x = parseFloat(args[i++]),
        s = args[i++];
    client.sync.query({
      text: 'INSERT INTO foo (n, x, s) VALUES ($1, $2, $3)',
      values: [n, x, s]
    });
    inserted++;
  }
  var result = inserted;
  if (inserted === 0) {
    var result = client.sync.query('SELECT * FROM foo');
  }
  client.end();
  return result;
}, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
