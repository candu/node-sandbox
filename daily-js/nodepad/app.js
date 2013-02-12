var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    Document = require('models').Document;

var app = express();

app.configure(function() {
  app.set('db', 'nodepad');
  app.use(express.logger());
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('test', function() {
  app.set('db', 'nodepad-test');
  app.use(express.errorHandler());
});

app.configure(function() {
  console.log('connecting to DB: ' + app.get('db'));
  mongoose.connect('mongodb://localhost/' + app.get('db'));
});

app.get('/', function(req, res) {
  res.send('hello there!');
});

app.get('/documents.:format?', function(req, res) {
  Document.find(function(err, documents) {
    switch (req.params.format) {
      case 'json':
        res.send(documents.map(function(d) {
          return d.__doc;
        }));
        break;
      default:
        res.render('documents/index');
    }
  });
});

app.post('/documents.:format?', function(req, res) {
  var documentData = JSON.parse(req.body.document),
      document = new Document(documentData);
  document.save(function() {
    switch (req.params.format) {
      case 'json':
        res.send(document);
        break;
      default:
        res.redirect('/documents');
    }
  });
});

app._listen = app.listen;
app.listen = function() {
  console.log(arguments);
  app._listen.apply(app, arguments);
};

module.exports = app;

if (require.main === module) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}
