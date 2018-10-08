const route = require('express').Router();

route.get('/', (req, res) => {
  res.render('chat', {
    title: 'Chat',
  });
});

module.exports = route;
