var express = require('express'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    _ = require('../../lib/underscore');

function ChatRoomManager() {
  this._rooms = {};
}
ChatRoomManager.prototype.openRoom = function(name) {
  if (_.has(this._rooms, name)) {
    return;
  }
  this._rooms[name] = io.of('/' + name + '/listen')
    .on('connection', function(socket) {
      socket.on('set name', function(data) {
        socket.set('user', data.user, function() {
          socket.emit('begin chat');
        });
      });
    });
};
ChatRoomManager.prototype.sendMessage = function(name, query) {
  console.log(query.user + ': ' + query.text);
  this._rooms[name].emit('add text', {
    user: query.user,
    text: query.text
  });
};

var app = express(),
    chat = new ChatRoomManager();

app.get('/:room', function(req, res) {
  chat.openRoom(req.params.room);
  res.sendfile('client.html');
});

app.get('/:room/addText', function(req, res) {
  chat.sendMessage(req.params.room, req.query);
  res.type('text').send('OK');
});

var server = http.createServer(app),
    io = require('socket.io').listen(server);

server.listen(3000, function() {
  console.log(JSON.stringify(server.address()));
});
