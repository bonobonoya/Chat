const createError = require('http-errors');
const express = require('express');
const mysql = require('mysql');

const app = express();
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const MySQLStore = require('express-mysql-session')(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const chatRouter = require('./routes/chat');

const keys = require('./keys.json');

// database setting
const pool = mysql.createPool({
  host: 'localhost',
  user: keys.database.user,
  password: keys.database.password,
  database: 'chat',
  port: '3306',
});

pool.getConnection((err, conn) => {
  if (err) throw err;
  conn.query(`CREATE TABLE IF NOT EXISTS chat_log(
    time timestamp not null,
    name char(32) not null,
    ip char(32) not null,
    msg text
    )Engine='InnoDB' default charset='utf8'`, (error) => {
    conn.release();
    if (error) throw error;
  });
});

const Session = session({
  store: new MySQLStore({}, pool),
  secret: keys.sessionKey,
  resave: false,
  saveUninitialized: true,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('pool', pool);
app.set('session', Session);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(Session);
app.use((req, res, next) => {
  if (!fs.existsSync(path.join(__dirname, 'log'))) {
    fs.mkdirSync(path.join(__dirname, 'log'));
  }
  if (!fs.existsSync(path.join(__dirname, 'log/chat.log'))) {
    fs.closeSync(fs.openSync(path.join(__dirname, 'log/chat.log'), 'w'));
  }
  next();
});

// routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next();
});

module.exports = app;
