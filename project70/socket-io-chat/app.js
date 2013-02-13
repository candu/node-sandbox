var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    _ = require('../../lib/underscore');

app.listen(3000);

var _data = null;
function root(req, res) {
  if (_data !== null) {
    res.write(_data);
    res.end();
  }
  fs.readFile(path.join(__dirname, 'client.html'), function(err, data) {
    _data = data;
    res.write(_data);
    res.end();
  });
}

function addText(req, res) {
  var query = req.url.query;
  console.log(query.user + ': ' + query.text);
  listen.emit('add text', {
    user: query.user,
    text: query.text
  });
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.write('OK');
  res.end();
}

function handler(req, res) {
  var _url = req.url;
  req.url = url.parse(_url, true);
  switch (req.url.pathname) {
    case '/':
      root(req, res);
      break;
    case '/addText':
      addText(req, res);
      break;
    default:
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      res.write('Cannot GET ' + _url);
      res.end();
  }
}

var listen = io.of('/listen')
  .on('connection', function(socket) {
    socket.on('set name', function(data) {
      socket.set('user', data.user, function() {
        socket.emit('begin chat');
      });
    });
  });
