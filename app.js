var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var multer = require('multer');
var expressValidator = require('express-validator');
var fm = require('./controllers/FileManager');
var fs = require("fs");
var grex = require('grex');
var user = require('./controllers/User');
var session = require('express-session');
var passport = require('./config/passport');






//Connecting to mongo here


var settings = {
    'host': 'localhost',
    'port': 8182,
    'graph': 'graph'
};

/**
 * Setup grex here
 */
var client = grex.createClient(settings);

var gremlin = grex.gremlin;
var g = grex.g;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(expressValidator());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(multer());
app.use(compress());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', function (req, res) {
    res.render("index");
});

app.get('/login', function (req, res) {
   res.render('login', {title: 'Login'});
});
app.get('/user', function (req, res) {
    if(req.session.passport.user === undefined){
        res.redirect('/login');
    }
    else{

        res.render('user', {user: req.user});
    }
});
app.post('/login', user.postLogin);
app.post('/register', user.postRegister);
app.post('/addComment', user.postAddComment);
app.post('/addUpload',fm.uploadFile);
app.post('/addFriend', user.postFriendUser);
app.post('/addLike', user.postAddLike);
app.get('/userInfo', function (req, res) {

   res.json({user: req.user});
});
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});



/**
 * Start Express server on given port
 */

app.listen(app.get('port'), function() {
    console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

module.exports = app;
