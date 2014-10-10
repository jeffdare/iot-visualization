var express = require('express');
var router = express.Router();

var api_routes = require('./api');
var dashboard_routes = require('./dashboard');
var auth_routes = require('./auth');

//all requests come here to validate the if api key is present
//else redirect to login
router.use(function(req, res, next) {

	//check to see if we are in Bluemix and if we are bound to IoT service		
		if (! req.session.api_key && process.env.VCAP_SERVICES)
		{
			var env = JSON.parse(process.env.VCAP_SERVICES);
			for (var svcName in env) 
			{
				//find the IoT Service
				for (var i=0;i<env['user-provided'].length;i++)
				{
					if (env['user-provided'][i].credentials.iotCredentialsIdentifier)
					{
						//found an IoT service so bind api_key and api_token session variables
						req.session.api_key=env['user-provided'][i].credentials.apiKey;
						req.session.auth_token=env['user-provided'][i].credentials.apiToken;
						req.session.isBluemix= true;
						res.redirect("/dashboard");
					}
				}
			}
		

		}

	// for api calls, send 401 code
	else if(! req.session.api_key && req.path.indexOf('api') != -1) {
		res.status(401).send({error: "Not authorized"});
	}
	// for all others, redirect to login page
	else if(! req.session.api_key && req.path.indexOf('login') === -1) {
		res.redirect("/login");
	} else {
		next();
	}
});

//manage login routes
router.use('/',auth_routes);
//dashboard routes
router.use('/dashboard', dashboard_routes);
//proxy api routes TODO: remove this after datapower handles the CORS requests
router.use('/api/v0001',api_routes);


module.exports = router;