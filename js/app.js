var NeighborhoodMapViewModel = function(locations) {
    var self = this;

    var mapOptions = {
        center: { lat: 35.1271595, lng: -80.7088114 },
        zoom: 15
    };

    self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    self.locations = ko.observableArray(locations);

	self.query = ko.observable('');

	self.visibleLocations = ko.computed(
		function() {
			return self.locations().filter(
				function(location) {
					return self.query() === '' ? true : location.name.startsWith(self.query());
				}
			);
		}, this);
};

ko.applyBindings(
    new NeighborhoodMapViewModel([
        {
            name: 'Matthews Elementary School'
        },
        {
            name: 'BBQ'
        },
        {
            name: 'Ice Cream'
        }
    ])
);