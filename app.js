var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');

var routes = require('./routes/index');
var users = require('./routes/users');
var deliveries = require('./routes/deliveries');

var app = express();

// database setup
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/grocerydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'index', helpers: {ifIsPast: function(time, now, options) {
        if (now >= time) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    add: function(a, b) {
        return a+b;
}}}));
app.set('view engine', 'hbs');

// set up a secret to encrypt cookies
app.use(session({ secret : process.env.SECRET || '6170GroceryShip', resave : true, saveUninitialized : true }));
app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    // stores env so we can send the correct verification link
    req.env = app.get('env');
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/deliveries', deliveries);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
