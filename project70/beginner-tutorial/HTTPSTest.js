var https = require('https'),
    fs = require('fs');
var opts = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./certificate.pem')
};
var server = https.createServer(opts).listen(443, 'localhost');
server.on('request', function(request, response) {
  console.log('request!');
  response.write('<html><body>response!</body></html>');
  response.end();
});
server.on('connection', function(socket) {
  console.log('connection!');
});
server.on('close', function() {
  console.log('close!');
});
server.on('checkContinue', function(request, response) {
  console.log('checkContinue!');
  response.writeContinue();
  response.end();
});
server.on('connect', function(request, socket, head) {
  console.log('connect!');
});
server.on('upgrade', function(request, socket, head) {
  console.log('upgrade!');
});
server.on('clientError', function(exception) {
  console.log('clientError!');
});
