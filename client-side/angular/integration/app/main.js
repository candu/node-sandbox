var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require
});

requirejs([
  'argparse',
  'http',
  'util',
  'app'
], function(argparse, http, util, app) {
  function parseArgs() {
    var parser = new argparse.ArgumentParser({addHelp: true});
    parser.addArgument(['-p', '--port'], {
      help: 'port to listen on',
      type: Number,
      defaultValue: 3000,
      dest: 'port'
    });
    parser.addArgument(['-H', '--host'], {
      help: 'hostname/IP to bind to',
      type: String,
      default: 'localhost',
      dest: 'host'
    });
    return parser.parseArgs();
  }

  var args = parseArgs(),
      server = http.createServer(app);

  server.listen(args.port, args.host, function onListen() {
    var msg = util.format('Listening on %j', server.address());
    console.log(msg);
  });

  return {};
});
