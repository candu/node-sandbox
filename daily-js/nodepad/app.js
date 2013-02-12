var express = require('express'),
    MongoStore = require('connect-mongo')(express),
    stylus = require('stylus'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    _ = require('../../lib/underscore'),
    models = require('models');

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
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.configure('test', function() {
  app.set('db', 'nodepad-test');
  app.use(express.errorHandler());
});

app.configure(function() {
  console.log('connecting to DB: ' + app.get('db'));
  app.set('db-uri', 'mongodb://localhost/' + app.get('db'));
  var db = mongoose.connect(app.get('db-uri'))
      store = new MongoStore({db: db.connections[0].db});
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'sooperseekret',
    store: store
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

function loadUser(req, res, next) {
  if (req.session.userID) {
    var _id = mongoose.Types.ObjectId(req.session.userID);
    models.User.findById(_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else {
    res.redirect('/sessions/new');
  }
}

app.get('/sessions/new', function(req, res) {
  res.render('sessions/new', {user: new models.User()});
});

app.post('/sessions', function(req, res) {
  models.User.findOne({email: req.body.user.email}, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.userID = user.id;
      res.redirect('/documents');
    } else {
      res.redirect('/sessions/new');
    }
  });
});

app.del('/sessions', loadUser, function(req, res) {
  if (req.session) {
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
});

app.get('/users/new', function(req, res) {
  res.render('users/new', {user: new models.User()});
});

app.post('/users.:format?', function(req, res) {
  var data = req.body.user;
  if (_.isString(data)) {
    data = JSON.parse(data);
  }
  var user = new models.User(data);
  user.save(function() {
    switch (req.params.format) {
      case 'json':
        res.send(user);
        break;
      default:
        req.session.userID = user.id;
        res.redirect('/documents');
    }
  });
});

app.get('/', loadUser, function(req, res) {
  res.send('hello there!');
});

app.get('/documents.:format?', loadUser, function(req, res) {
  models.Document.find(function(err, documents) {
    switch (req.params.format) {
      case 'json':
        res.send(documents);
        break;
      default:
        res.render('documents/index', {documents: documents});
    }
  });
});

app.post('/documents.:format?', loadUser, function(req, res) {
  var data = req.body.document;
  if (_.isString(data)) {
    data = JSON.parse(data);
  }
  var d = new models.Document(data);
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

app.get('/documents/:id.:format?/edit', loadUser, function(req, res) {
  models.Document.findById(req.params.id, function(err, d) {
    // TODO: error handling
    res.render('documents/edit', {d: d});
  });
});

app.get('/documents/new', loadUser, function(req, res) {
  res.render('documents/new', {d: new models.Document() });
});

app.get('/documents/:id.:format?', loadUser, function(req, res) {
  models.Document.findById(req.params.id, function(err, d) {
    switch (req.params.format) {
      case 'json':
        res.send(d);
        break;
      default:
        res.render('documents/view', {d: d});
    }
  });
});

app.put('/documents/:id.:format?', loadUser, function(req, res) {
  models.Document.findById(req.body.document.id, function(err, d) {
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
