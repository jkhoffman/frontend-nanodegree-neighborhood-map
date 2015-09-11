"use strict";

$(function() {
	var MapViewModel = function() {
		var self = this;

		var mapOptions = {
			center: { lat: 35.11596183, lng: -80.72239294 },
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			zoom: 17,
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
				name: 'Matthews Elementary School',
				address: '200 McDowell Avenue, Matthews, NC 28105'
			},
			{
				name: 'Charlotte Mecklenburg Library - Matthews',
				address: '230 Matthews Station St, Matthews, NC 28105'
			},
			{
				name: 'Dilworth Coffee',
				address: '110 Matthews Station St #1A, Matthews, NC 28105'
			},
			{
				name: 'Kristophers Bar & Restaurant',
				address: 'Depot Shopping Center, 250 N Trade St, Matthews, NC 28105'
			},
			{
				name: 'Moe\'s Original Bar B Que',
				address: '111 Matthews Station St, Matthews, NC 28105'
			},
			{
				name: 'Matthews Community Farmers\' Market',
				address: '188 N Trade St, Matthews, NC 28105'
			},
			{
				name: 'US Post Office',
				address: '301 E John St, Matthews, NC 28105'
			}
		]);

		self.selectedLocation = ko.observable({});

		self.selectLocation = function(location) {
			self.selectedLocation(location);
		};

		self.selectedLocation.subscribe(
			function(newValue) {
				var oauth = OAuth({
					consumer: {
						public: 'URxwLlsZPPy6lguir-kjuA',
						secret: 'qIUKWV3Xp9V4mDIxYVOAjitm2zk'
					},
				    signature_method: 'HMAC-SHA1'
				});

				var request_data = {
					url: 'http://api.yelp.com/v2/search',
					method: 'POST',
					data: {
						term: 'test'
					}
				};

				var token = {
					public: 'pXHwjZaEe44cbyN7bvoAj40aPN7MBrF7',
					secret: 'aX-1lzgLhGzwwI8bqyIYfIVDbgY'
				};

				$.ajax({
					url: request_data.url,
					type: request_data.method,
					data: oauth.authorize(request_data, token)
				}).done(function(data) {
					console.dir(data);
				});

				self.infoWindow.setContent(
					"<h3>" + newValue.name + "</h3>" +
					"<p>" + newValue.address + "</p>"
				);
				self.infoWindow.open(self.map, newValue.marker);
				self.map.panTo(newValue.marker.position);
			}
		);

		self.markers = ko.observableArray([]);

		window.onload = function() {
			self.locations().forEach(function(location, index, array) {
				self.geocoder.geocode({ 'address': location.address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						location.position = results[0].geometry.location;

						setTimeout(function() {
							location.marker = new google.maps.Marker({
								animation: google.maps.Animation.DROP,
								position: location.position,
								map: self.map,
								title: location.name
							});
							self.markers.push(location.marker);
							google.maps.event.addListener(location.marker, 'click', function() {
								self.selectedLocation(location);
							});
						}, index * 200);
					} else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				});
			});
		};

		self.query = ko.observable('');

		self.query.subscribe(
			function(newValue) {
				self.markers().forEach(function(marker, index, array) {
					marker.title.toLowerCase().includes(newValue.toLowerCase()) ?
						marker.setMap(self.map) :
						marker.setMap(null);
				})
			});

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
