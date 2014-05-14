var destination = require('./destinations');

delete require.cache['./routes/destinations'];


module.exports = function(app, passport) {


	app.get('*', function(req, res, next) {
		
		// put user into res.locals for easy access from templates
		if (req.user) {
			 res.locals.user = req.user;		 
		}		 
		else {
			res.locals.user = null;
		}

		  next();
	});
	
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		var rememberme="unchecked";
		var user = null;
		if (res.locals.user) {
			user = res.locals.user;
			if(user.local.rememberme===1) {
				rememberme="checked";
			}
		}
		res.render('index', { title: 'India Tourism' ,_user : user , rememberme: rememberme  });
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		var rememberme="unchecked";
	//	console.log(res.locals.user);
		if (res.locals.user) {
			if(res.locals.user.local.rememberme===1) {
				rememberme="checked";
			}
		}
		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage') , rememberme: rememberme  });
	
	});

	// process the login form
	// app.post('/login', do all our passport stuff here);
	app.post('/login',function(req, res, next) { 
    	var thirtyDays = 30*24*60*60*1000;
    	req.session.cookie.expires = new Date(Date.now() + thirtyDays);
    	req.session.cookie.maxAge = thirtyDays;
	    next();
	},passport.authenticate('local-login', {
		successRedirect : '/', // redirect to the home page
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup', { message: req.flash('signupMessage') });
	});
	

	// process the signup form
	// app.post('/signup', do all our passport stuff here);
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the home page
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		//res.send(req.user);

	    res.render('profile', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/profiledata', isLoggedIn, function(req, res) {
		res.send(req.user);
	});
	
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
		
	app.get('/destinations', destination.findAll);
	app.get('/destinations/:id', destination.findById);
	app.post('/destinations', destination.addDestination);
	app.put('/destinations/:id', destination.updateDestination);
	app.delete('/destinations/:id', destination.deleteDestination);
	
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}