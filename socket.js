const fs = require('fs');
const sanitizeHTML = require('sanitize-html');

// for writing
function generateUID () {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = (`000${firstPart.toString(36)}`).slice(-3);
  secondPart = (`000${secondPart.toString(36)}`).slice(-3);
  return firstPart + secondPart;
}

const colors = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

module.exports = function (server) {
  const io = require('socket.io').listen(server);

  const users = {};

  io.on('connection', (socket) => {
    function updateUserList () {
      const userList = [];
      for (const key in users) {
        userList.push(users[key]);
      }
      io.emit('updateUserList', userList);
    }

    socket.on('login', (data) => {
      const user = {
        name: generateUID(),
        color: colors[Math.floor(Math.random() * 12)]
      };
      while (user.name in users) {
        user.name = generateUID();
      }
      users[socket.id] = user;
      io.emit('login', user);
      updateUserList();
    });

    socket.on('send', (data) => {
      const timeStamp = new Date().toLocaleString();
      const address = socket.handshake.address;
      data.desc = sanitizeHTML(data.desc);
      setTimeout(() => {
        fs.appendFileSync('log/chat', `[${timeStamp.toLocaleString()}] ${data.name}(${address}) - ${data.desc}\n`);
      }, 0);
      io.emit('msg', {
        name: users[socket.id].name,
        desc: data.desc,
        color: users[socket.id].color
      });
    });

    socket.on('changeName', (data) => {
      data.name = sanitizeHTML(data.name);
      if (!data.name.length) {
        return socket.emit('changeName', {
          error: 'invalid name.'
        });
      }
      for (const key in users) {
        if (users[key].name === data.name) {
          return socket.emit('changeName', {
            error: 'already has name.'
          });
        }
      }
      io.emit('changeName', {
        before: users[socket.id].name,
        after: data.name,
        color: users[socket.id].color
      });
      users[socket.id].name = data.name;
      updateUserList();
    });

    socket.on('disconnect', (reason) => {
      io.emit('logout', users[socket.id]);
      delete users[socket.id];
      updateUserList();
    });

    socket.on('connect_timeout', (timeout) => {
      updateUserList();
    });
  });
};
