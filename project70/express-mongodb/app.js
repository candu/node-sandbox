var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(path.join(__dirname, '/public')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var articleProvider = new ArticleProvider('localhost', 27017);

app.get('/', function(req, res) {
  articleProvider.findAll(function(error, docs) {
    res.render('index', {title: 'Blog', articles: docs});
  });
});

app.get('/new', function(req, res) {
  res.render('new', {title: 'New Post'});
});

app.post('/new', function(req, res) {
  articleProvider.save({
    title: req.param('title'),
    body: req.param('body')
  }, function(error, docs) {
    res.redirect('/');
  });
});

app.get('/view/:id', function(req, res) {
  articleProvider.findById(req.params.id, function(error, article) {
    res.render('view', {title: article.title, article: article});
  });
});

app.post('/comment/new', function(req, res) {
  articleProvider.addCommentToArticle(req.param('_id'), {
    person: req.param('person'),
    comment: req.param('comment'),
    created_at: new Date()
  }, function(error, docs) {
    res.redirect('/view/' + req.param('_id'));
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
