define([
  'express',
  'path',
  'module'
], function(express, path, module) {
  var __dirname = path.dirname(module.uri),
      basedir = path.join(__dirname, '..', '..', '..');
  var app = express();
  app.use('/static', express.static(path.join(basedir, 'static')));
  app.set('views', path.join(basedir, 'views'));
  app.set('view engine', 'jade');
  app.get('/', function(req, res) {
    res.render('index');
  });
  return app;
});
