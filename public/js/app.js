"use strict";

$(function() {
	var MapViewModel = function() {
		var self = this;

		var mapOptions = {
			center: { lat: 35.1165518, lng: -80.7207504 },
			mapTypeControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			zoom: 18,
			styles: [
				{
					featureType: "poi",
					elementType: "labels",
					stylers: [
						{ visibility: "off" }
					]
				}
			]
		};

		self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		self.geocoder = new google.maps.Geocoder();

		self.locations = ko.observableArray([
			{
				name: 'Dilworth Coffee',
				address: '110 Matthews Station St #1A, Matthews, NC 28105',
				yelp_id: 'dilworth-coffeehouse-matthews-station-matthews'
			},
			{
				name: 'Royal Cafe & Creperie',
				address: '131 Matthews Station St, Ste E, Matthews, NC 28105',
				yelp_id: 'royal-cafe-and-creperie-matthews'
			},
			{
				name: 'Beantown Tavern',
				address: '130 Matthews Station St, Matthews, NC 28105',
				yelp_id: 'beantown-tavern-matthews'
			},
			{
				name: 'Kristophers Bar & Restaurant',
				address: 'Depot Shopping Center, 250 N Trade St, Matthews, NC 28105',
				yelp_id: 'kristophers-bar-and-restaurant-matthews'
			},
			{
				name: 'Moe\'s Original Bar-B-Que',
				address: '111 Matthews Station St, Matthews, NC 28105',
				yelp_id: 'moes-original-bar-b-que-matthews'
			},
			{
				name: 'Matthews Community Farmers\' Market',
				address: '188 N Trade St, Matthews, NC 28105',
				yelp_id: 'matthews-community-farmers-market-matthews'
			},
			{
				name: 'Santé',
				address: '165 N Trade St, Matthews, NC 28105',
				yelp_id: 'sante-matthews'
			},
			{
				name: 'Taco & Tequila Cantina Grill',
				address: '131 E John St, Matthews, NC 28105',
				yelp_id: 'tacos-and-tequila-cantina-grill-matthews'
			}
		]);

		self.selectedLocation = ko.observable({});

		self.selectLocation = function(location) {
			self.selectedLocation(location);
		};

		self.selectedLocation.subscribe(
			function(location) {
				$.get("http://localhost:8080/business", { id: location.yelp_id })
					.done(function(yelpData) {
						// bounce the location's marker one time, then...
						location.marker.setAnimation(google.maps.Animation.BOUNCE);

						// update infoWindow with the data from Yelp
						yelpData = JSON.parse(yelpData);
						self.infoWindow.close();
						self.infoWindow.setContent(
							"<h3>" + yelpData.name + " <img src=\"" + yelpData.rating_img_url_small + "\"></h3>" +
							"<p>\"" + yelpData.snippet_text + "\"</p>" +
							"<p>" + yelpData.location.display_address.join('<br>') + "</p>" +
							"<p>" + yelpData.display_phone + "</p>"
						);

						// Wait 750ms (one bounce), then stop bouncing, pan to the marker and open the info window
						setTimeout(function () {
							location.marker.setAnimation(null);

							// center the map on the location
							self.map.panTo(location.marker.position);

							self.infoWindow.open(self.map, location.marker);
						}, 750);
					})
					.fail(function () {
						alert("Error retrieving Yelp data. Please check README for troubleshooting advice.");
					});
			}
		);

		self.markers = ko.observableArray([]);

		window.onload = function() {
			self.locations().forEach(function(location, index, array) {

				// convert address to lat/long
				self.geocoder.geocode({ 'address': location.address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						location.position = results[0].geometry.location;

						// use timer to stagger markers, so they don't all show at once
						setTimeout(function() {

							// create the marker and save it on the location for later use
							location.marker = new google.maps.Marker({
								animation: google.maps.Animation.DROP,
								position: location.position,
								map: self.map,
								title: location.name
							});

							google.maps.event.addListener(location.marker, 'click', function() {
								self.selectedLocation(location);
							});

							self.markers.push(location.marker);
						}, index * 250);
					} else {
						alert("Geocode was not successful: " + status);
					}
				});
			});
		};

		self.query = ko.observable('');

		/**
		 * Add/remove each marker to/from map via case-insensitive title comparison
		 */
		self.query.subscribe(
			function(newValue) {
				self.markers().forEach(function(marker, index, array) {
					marker.title.toLowerCase().includes(newValue.toLowerCase()) ?
						marker.setMap(self.map) :
						marker.setMap(null);
				})
			});

		/**
		 * Filters the list of visible locations in the menu by case-insensitive title comparison
		 */
		self.visibleLocations = ko.computed(
			function() {
				return self.locations().filter(
					function(location) {
						return self.query() === '' ?
							true :
							location.name.toLowerCase().includes(self.query().toLowerCase());
					}
				);
			}, this);

		self.infoWindow = new google.maps.InfoWindow();
	};

	$("#menu").mmenu({
		extensions: [ 'widescreen', 'theme-white', 'effect-slide-menu', 'pageshadow' ],
		navbar: false,
		onClick: {
			close: false
		},
		navbars: {
			height: 1,
			content: [
				'<div class="mm-search"><input id="search-input" type="text" name="query" placeholder="Search" data-bind="textInput: query"></div>'
			]
		}
	});

	ko.applyBindings(new MapViewModel());
});
