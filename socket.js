const socketio = require('socket.io');
const sanitizeHTML = require('sanitize-html');

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

module.exports = (server, Session, pool) => {
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

    socket.on('getLatestMsg', () => {
      pool.getConnection((err, conn) => {
        if (err) throw err;
        conn.query('SELECT name, msg FROM chat_log ORDER BY time DESC LIMIT 10', (error, result) => {
          conn.release();
          if (error) throw error;
          socket.emit('latestMsg', result);
        });
      });
    });

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
        sessionData.save();
        users[socket.id] = user;
        io.emit('login', user);
      }
      updateUserList();
    });

    socket.on('send', (data) => {
      const timeStamp = new Date().toLocaleString();
      const sanitizedDesc = sanitizeHTML(data.desc);
      pool.getConnection((err, conn) => {
        if (err) throw err;
        conn.query('INSERT INTO chat_log(time, name, ip, msg) VALUES(?, ?, ?, ?)',
          [timeStamp, users[socket.id].name, socket.handshake.address, sanitizedDesc],
          (error) => {
            conn.release();
            if (error) throw error;
          });
      });
      io.emit('msg', {
        name: users[socket.id].name,
        desc: sanitizedDesc,
        color: users[socket.id].color,
      });
    });

    socket.on('changeName', (data) => {
      const sanitizedName = sanitizeHTML(data.name);
      const originName = users[socket.id].name;
      if (!sanitizedName.length) {
        socket.emit('changeName', {
          error: 'invalid name.',
        });
      } else if (sanitizedName.length > 32) {
        socket.emit('changeName', {
          error: 'too lengthy(max 31 char)',
        });
      } else {
        try {
          Object.keys(users).forEach((key) => {
            if (users[key].name === sanitizedName) {
              throw new Error();
            }
          });
        } catch (e) {
          socket.emit('changeName', {
            error: 'already has name.',
          });
          return;
        }
        sessionData.user.name = sanitizedName;
        sessionData.save();
        users[socket.id].name = sanitizedName;
        io.emit('changeName', {
          before: originName,
          after: sanitizedName,
          color: users[socket.id].color,
        });
        updateUserList();
      }
    });

    socket.on('disconnect', () => {
      io.emit('logout', users[socket.id]);
      delete users[socket.id];
      updateUserList();
    });
  });
};
