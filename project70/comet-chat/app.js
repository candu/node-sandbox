var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    _ = require('../../lib/underscore');

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

var _responses = {};
function listen(req, res) {
  var query = req.url.query;
  if (_.has(_responses, query.user)) {
    _responses[query.user].end();
  }
  _responses[query.user] = res;
  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8',
    'Transfer-Encoding': 'chunked'
  });
}

function addText(req, res) {
  var query = req.url.query;
  console.log(query.user + ': ' + query.text);
  _.each(_responses, function(res, user) {
    res.write(
      '<script>parent.addText("' +
      query.user + '", "' + query.text + '");</script>'
    );
  });
  res.end();
}

http.createServer(function(req, res) {
  var _url = req.url;
  req.url = url.parse(_url, true);
  switch (req.url.pathname) {
    case '/':
      root(req, res);
      break;
    case '/listen':
      listen(req, res);
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
}).listen(3000);
