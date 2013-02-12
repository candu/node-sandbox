var midgard = require('./midgard');

var noop = function(req, res, next) {
  next();
};

var fail = function(req, res, next) {
  next('failed!');
};

var stop = function(req, res, next) {
  res.write('stopped!');
  res.end();
};

var server = midgard();
for (var i = 2; i < process.argv.length; i++) {
  var mid = process.argv[i];
  switch (mid) {
    case 'noop':
      server.use(noop);
      break;
    case 'fail':
      server.use(fail);
      break;
    case 'stop':
      server.use(stop);
      break;
  }
}
server.get('/', function(req, res) {
  res.write('success!');
  res.end();
});
server.listen(3000);
