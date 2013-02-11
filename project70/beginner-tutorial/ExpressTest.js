var express = require('express'),
    path = require('path'),
    products = require('./products'),
    _ = require('../../lib/underscore');

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(express.static(path.join(__dirname, 'static')));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  //throw new Error('My error here');
  res.render('root');
});

app.get('/products', function(req, res) {
  res.render('products/index', {products: products.all});
});

app.get('/products/:id', function(req, res) {
  var product = products.find(req.params.id);
  if (_.isUndefined(product)) {
    res.status(404).render('404');
    return;
  }
  res.render('products/show', {product: product});
});

app.listen(3000);
