var route = require('express').Router();

route.get('/', function (req, res, next) {
  res.render('chat', {
    title: 'Chat'
  });
});

// route.post('/', function (req, res, next) {
//   this.chatLogs = [];
//   var timeStamp = new Date();
//   var ip = req.ip;
//   for (x in req.body) {
//     req.body[x] = sanitizeHTML(req.body[x]);
//   }
//   chatLogs.push(req.body);
//   setTimeout(function () {
//     fs.appendFileSync('chat/log', `[${timeStamp.toLocaleString()}] ${req.body.sender}(${ip}) - ${req.body.desc}\n`)
//   }, 0);
//   while (users.length) {
//     users.pop().Callback(chatLogs);
//   }
//   chatLogs = [];
//   res.status(201).send();
// });

// route.post('/get', function (req, res, next) {
//   return users.push({
//     res: res,
//     Callback: function (data) {
//       this.res.send(data);
//     }
//   });
// });

// route.post('/users', function (req, res, next) {

// });

module.exports = route;