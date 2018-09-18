var fs = require('fs');
var sanitizeHTML = require('sanitize-html');

module.exports = function (server) {
  var io = require('socket.io').listen(server);

  io.on('connection', function (socket) {
    socket.on('login', function (data) {
      io.emit('login', data.sender);
    });

    socket.on('send', function (data) {
      var timeStamp = new Date().toLocaleString();
      var address = socket.handshake.address
      data.desc = sanitizeHTML(data.desc);
      setTimeout(function () {
        fs.appendFileSync('log/chat', `[${timeStamp.toLocaleString()}] ${data.sender}(${address}) - ${data.desc}\n`)
      }, 0);
      io.emit('msg', {
        sender: data.sender,
        desc: data.desc,
        color: data.color
      });
    });
  });
}