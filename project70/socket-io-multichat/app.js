var express = require('express'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    _ = require('../../lib/underscore');

var app = express();

app.get('/', function(req, res) {
  res.sendfile('client.html');
});

app.get('/addText', function(req, res) {
  var query = req.query;
  console.log(query.user + ': ' + query.text);
  listen.emit('add text', {
    user: query.user,
    text: query.text
  });
  res.type('text').send('OK');
});

var server = http.createServer(app),
    io = require('socket.io').listen(server);

var listen = io.of('/listen')
  .on('connection', function(socket) {
    socket.on('set name', function(data) {
      socket.set('user', data.user, function() {
        socket.emit('begin chat');
      });
    });
  });

server.listen(3000, function() {
  console.log(JSON.stringify(server.address()));
});
