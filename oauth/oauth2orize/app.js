var oauth2 = require('lib/oauth2'),
    site = require('lib/site'),
    user = require('lib/user');

var ArgumentParser = require('argparse').ArgumentParser,
    express = require('express'),
    passport = require('passport'),
    path = require('path'),
    util = require('util');

var app = express();
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
  secret: 'keyboard cat',
  store: new express.session.MemoryStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.errorHandler());

require('lib/auth');

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/userinfo', user.info);

function parseArgs() {
  var parser = new ArgumentParser({addHelp: true});
  parser.addArgument(['-p', '--port'], {
    help: 'port to listen on',
    type: Number,
    defaultValue: 8081,
    dest: 'port'
  });
  parser.addArgument(['-H', '--host'], {
    help: 'hostname/IP to bind to',
    type: String,
    defaultValue: 'localhost',
    dest: 'host'
  });
  return parser.parseArgs();
}

var args = parseArgs();
app.listen(args.port, args.host);
console.log(util.format('Listening on %s:%d', args.host, args.port));
