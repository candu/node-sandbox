var fs = require('fs'),
    express = require('express'),
    mongoose = require('mongoose'),
    url = require('url'),
    fibrous = require('fibrous');

var app = express();
app.use(express.bodyParser());
app.use(express.logger());
app.use(express.errorHandler());

// NOTE: this MUST be last, since it wraps the entire request in a fibrous
// context!
app.use(fibrous.middleware);

mongoose.connect('mongodb://localhost/fibrous-test');
var WidgetSchema = mongoose.Schema({
  name: String,
  price: Number
});
WidgetSchema.index({name: 1});
var Widget = mongoose.model('Widget', WidgetSchema);

app.get('/', function(req, res) {
  var widgets = Widget.sync.find();
  console.log(widgets);
  res.type('json');
  res.send(widgets);
});

app.post('/', function(req, res) {
  var widget = new Widget({
    name: req.body.name,
    price: parseFloat(req.body.price)
  });
  widget.sync.save();
  res.type('json');
  res.send(widget);
});

app.listen(3000);
