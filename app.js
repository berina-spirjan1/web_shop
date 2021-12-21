const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const homeRouter = require('./routes/home');
const shopsRouter = require('./routes/shops');
const ordersRouter = require('./routes/orders');
const itemsRouter = require('./routes/items');
const chainStoreRouter = require('./routes/chain_store');
const userTypeRouter = require('./routes/user_type');
const paymentRouter = require('./routes/payment');
const allUsersRouter = require('./routes/allUsers');
const shopCategoryRouter = require('./routes/shop_category');
const customerRouter = require('./routes/customer');

const app = express();
const passport = require('passport');
require('./configuration/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'svismoprogrameri123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/home/shops', shopsRouter);
app.use('/home/users', allUsersRouter);
app.use('/home/orders', ordersRouter);
app.use('/home/items', itemsRouter);
app.use('/home/payment', paymentRouter);
app.use('/home/user_type', userTypeRouter);
app.use('/home/shop_category', shopCategoryRouter);
app.use('/home/chain_store', chainStoreRouter);
app.use('/customer', customerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
