var fs = require('fs');
var sanitizeHTML = require('sanitize-html');

// for writing
function generateUID() {
  // I generate the UID from two parts here 
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = function (server) {
  var io = require('socket.io').listen(server);

  var users = {
    test: {
      name: 'testName',
      color: 'testColor'
    }
  };

  io.on('connection', function (socket) {
    socket.on('login', function (data) {
      var user = {
        name: generateUID(),
        color: getRandomColor()
      }
      while (user.name in users) {
        user.name = generateUID();
      }
      users[socket.id] = user;
      io.emit('login', user);
    });

    socket.on('send', function (data) {
      var timeStamp = new Date().toLocaleString();
      var address = socket.handshake.address
      data.desc = sanitizeHTML(data.desc);
      setTimeout(function () {
        fs.appendFileSync('log/chat', `[${timeStamp.toLocaleString()}] ${data.name}(${address}) - ${data.desc}\n`)
      }, 0);
      io.emit('msg', {
        name: users[socket.id].name,
        desc: data.desc,
        color: users[socket.id].color
      });
    });

    socket.on('disconnect', function (reason) {
      io.emit('logout', users[socket.id]);
      delete users[socket.id];
    });
  });
}