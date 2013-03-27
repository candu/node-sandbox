var express = require('express');

var app = express();
app.set('foo', 'bar');

app.get('/', function(req, res) {
  res.send(req.app.get('foo'));
});

app.listen(3000);
