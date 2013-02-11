var express = require('express'),
    path = require('path');

var app = express();

app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  //throw new Error('My error here');
  res.render('root');
});

app.listen(3000);
