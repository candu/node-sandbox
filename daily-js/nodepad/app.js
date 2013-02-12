var express = require('express'),
    stylus = require('stylus'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    _ = require('../../lib/underscore'),
    Document = require('models').Document;

var app = express();

var compileMethod = function(str) {
  return stylus(str).set('compress', true);
};

app.configure(function() {
  app.use(stylus.middleware({
    src: path.join(__dirname, 'public'),
    compress: true
  }));
  app.set('db', 'nodepad');
  app.use(express.logger());
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
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
        res.render('documents/index', {documents: documents});
    }
  });
});

app.post('/documents.:format?', function(req, res) {
  var data = req.body.document;
  if (_.isString(data)) {
    data = JSON.parse(data);
  }
  var d = new Document(data);
  d.save(function() {
    switch (req.params.format) {
      case 'json':
        res.send(d);
        break;
      default:
        res.redirect('/documents');
    }
  });
});

app.get('/documents/:id.:format?/edit', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    // TODO: error handling
    res.render('documents/edit', {d: d});
  });
});

app.get('/documents/new', function(req, res) {
  res.render('documents/new', {d: new Document() });
});

app.get('/documents/:id.:format?', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    switch (req.params.format) {
      case 'json':
        res.send(d);
        break;
      default:
        res.render('documents/view', {d: d});
    }
  });
});

app.put('/documents/:id.:format?', function(req, res) {
  Document.findById(req.body.document.id, function(err, d) {
    d.title = req.body.document.title;
    d.data = req.body.document.data;
    d.save(function() {
      switch (req.params.format) {
        case 'json':
          res.send(d);
          break;
        default:
          res.redirect('/documents');
      }
    });
  });
});

module.exports = app;

if (require.main === module) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}
