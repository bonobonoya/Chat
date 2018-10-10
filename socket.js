const socketio = require('socket.io');
const fs = require('fs');
const sanitizeHTML = require('sanitize-html');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

// for writing
function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656);
  let secondPart = (Math.random() * 46656);
  firstPart = (`000${firstPart.toString(36)}`).slice(-3);
  secondPart = (`000${secondPart.toString(36)}`).slice(-3);
  return firstPart + secondPart;
}

const colors = [
  '#e21400', '#91580f', '#f8a700', '#f78b00',
  '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
  '#3b88eb', '#3824aa', '#a700ff', '#d300e7',
];

const keys = require('./keys.json');

const Session = session({
  store: new FileStore(),
  secret: keys.sessionKey,
  resave: false,
  saveUninitialized: true,
});

module.exports = (server) => {
  const io = socketio.listen(server);
  const users = {};

  io.use((socket, next) => {
    Session(socket.handshake, {}, next);
  });

  io.on('connection', (socket) => {
    const sessionData = socket.handshake.session;

    function updateUserList() {
      const userList = [];
      Object.keys(users).forEach((key) => {
        userList.push(users[key]);
      });
      io.emit('updateUserList', userList);
    }

    socket.on('login', () => {
      if (sessionData.user) {
        users[socket.id] = sessionData.user;
        io.emit('login', sessionData.user);
      } else {
        const user = {
          name: generateUID(),
          color: colors[Math.floor(Math.random() * 12)],
        };
        while (user.name in users) {
          user.name = generateUID();
        }
        sessionData.user = user;
        users[socket.id] = user;
        io.emit('login', user);
      }
      updateUserList();
    });

    socket.on('send', (data) => {
      const timeStamp = new Date().toLocaleString();
      const sanitizedDesc = sanitizeHTML(data.desc);
      setTimeout(() => {
        fs.appendFileSync('log/chat.log', `[${timeStamp.toLocaleString()}] ${data.name}(${socket.handshake.address}) - ${sanitizedDesc}\n`);
      }, 0);
      io.emit('msg', {
        name: users[socket.id].name,
        desc: sanitizedDesc,
        color: users[socket.id].color,
      });
    });

    socket.on('changeName', (data) => {
      // data.name = sanitizeHTML(data.name);
      if (!data.name.length) {
        socket.emit('changeName', {
          error: 'invalid name.',
        });
      }
      Object.keys(users).forEach((key) => {
        if (users[key].name === data.name) {
          socket.emit('changeName', {
            error: 'already has name.',
          });
        }
      });
      // for (const key in users) {
      //   if (users[key].name === data.name) {
      //     return socket.emit('changeName', {
      //       error: 'already has name.',
      //     });
      //   }
      // }
      io.emit('changeName', {
        before: users[socket.id].name,
        after: data.name,
        color: users[socket.id].color,
      });
      users[socket.id].name = data.name;
      updateUserList();
    });

    socket.on('disconnect', () => {
      io.emit('logout', users[socket.id]);
      delete users[socket.id];
      updateUserList();
    });

    socket.on('connect_timeout', () => {
      updateUserList();
    });
  });
};
