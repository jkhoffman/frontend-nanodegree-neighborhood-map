var NeighborhoodMapViewModel = function(mapOptions) {
    this.map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
};

ko.applyBindings(new NeighborhoodMapViewModel({
    center: { lat: 35.1271595, lng: -80.7088114},
    zoom: 14
}));