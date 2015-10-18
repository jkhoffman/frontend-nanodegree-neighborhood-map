"use strict";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var jsonfile = require('jsonfile');

var yelp;
jsonfile.readFile(__dirname + '/server.config.json', function(err, config) {
	if (err) {
		console.log('Error reading server.config.json: ' + err);
		process.exit(1);
	}

	yelp = require('yelp').createClient({
		consumer_key: config.yelp.consumer_key,
		consumer_secret: config.yelp.consumer_secret,
		token: config.yelp.token,
		token_secret: config.yelp.token_secret,
		ssl: true
	});

	// Listen on port specified in server.config.json.
	server.listen(config.port, function () {
		console.log("Matthews Neighborhood Map Server listening on http://localhost:%s", config.port);
	});
});

// Serve static files in /public
app.use(express.static(__dirname + '/public'));

// Listen for GET requests on /business
app.get('/business', function (req, res) {

	// Check for "id" parameter, ?id=
	if (!"id" in req.query) {
		res.send('Error: "id" parameter required.');
		return;
	}

	console.log("Requesting Yelp data for id: " + req.query.id);

	// Get data from Yelp's API about the requested business
	yelp.business(req.query.id, function (err, data) {
		if (err) {
			res.send(err.data);
			return;
		}

		res.send(JSON.stringify(data));
	});
});