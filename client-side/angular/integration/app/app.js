define([
  'express',
  'path',
  'module',
  'api/index'
], function(express, path, module, api) {
  var __dirname = path.dirname(module.uri);

  var app = express();
  app.use('/lib', express.static(path.join(__dirname, 'lib')));
  app.use('/static', express.static(path.join(__dirname, 'static')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.get('/', function(req, res) {
    res.render('index');
  });
  app.get('/api/foos', api.Foo.getAll);
  return app;
});
