/**
 * Module dependencies.
 */
var express = require('express');

// var user = require('./routes/user');
var http = require('http');
var path = require('path');

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorHandler');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

// get the environment specific configuration
var CONFIG = require('config').travelapp;

// Setup Database config for mongoose
var configDB = require('./config/userDb.js');

var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

var app = express();
var allowCrossDomain = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
}

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || CONFIG.port);
app.set('views', __dirname + CONFIG.viewDir);
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded())
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, CONFIG.publicFolder))); // location of the files

// required for passport
app.use(session({
	secret : CONFIG.secret,  	// session secret
	store : new MongoStore({
		url : configDB.url,
		maxAge : CONFIG.cookie_max_age
	}),
	cookie : {
		maxAge : CONFIG.cookie_max_age
	// one week
	}
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// development only
if ('development' === app.get('env')) {
	app.use(errorHandler());
	app.use(allowCrossDomain);
}

require('./routes/routes.js')(app, passport); // load our routes and pass in
												// our app and fully configured
												// passport
app.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});