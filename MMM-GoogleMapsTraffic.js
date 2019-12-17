/* global Module */

/* Magic Mirror
 * Module: MMM-GoogleMapsTraffic
 *
 * By Victor Mora
 * MIT Licensed.
 */

 Module.register("MMM-GoogleMapsTraffic", {
	// Module config defaults
	defaults : {
		key: '',
		lat: '',
		lng: '',
		height: '300px',
		width: '300px',
		zoom: 10,
        mapTypeId: 'roadmap',
        styledMapType: 'standard',
        disableDefaultUI: true,
        updateInterval: 300000,
        backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    distanceResponse : [],
    latestRequestTime: new Date(),

    start: function() {
        var self = this;
        Log.info("Starting module: " + this.name);

        if (this.config.key === "") {
            Log.error("MMM-GoogleMapsTraffic: key not set!");
            return;
        }

        this.sendSocketNotification("MMM-GOOGLE_MAPS_TRAFFIC-GET", {style: this.config.styledMapType});
        this.executeMapsRequest();
        setInterval(function() {
            self.executeMapsRequest();
        }, this.config.updateInterval);
    },
    executeMapsRequest: function () {
        var origin1 = new google.maps.LatLng(40.074816, -74.098967);
        var destinationA = new google.maps.LatLng(40.762314, -73.986900);

        var service = new google.maps.DistanceMatrixService();
        var transitOptions = {
            departureTime: new Date(),
            modes: ['BUS']
        }
        var self = this;
        service.getDistanceMatrix(
        {
            origins: [origin1],
            destinations: [destinationA],
            travelMode: 'DRIVING',
            transitOptions: transitOptions,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
        }, (response, status) => {
            this.distanceResponse = response;
            this.latestRequestTime = new Date();
            this.updateDom()
            }
        );
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.classList.add("medium");
        if (this.distanceResponse.length < 1) return wrapper;
        var travelTime = this.distanceResponse.rows[0].elements[0].duration.text;
        wrapper.innerHTML = `<span>It is currently ${travelTime} to work.               Last Checked: ${this.latestRequestTime.toLocaleTimeString('en-US')}</span>`;

        console.log("here")
        return wrapper;
    },
    callback(response, status) {
  // See Parsing the Results for
  // the basics of a callback function.
  debugger;
  this.updateDom();

}, 


	// socketNotificationReceived from helper
    socketNotificationReceived: function (notification, payload) {
        if(notification === "MMM-GOOGLE_MAPS_TRAFFIC-RESPONSE") {
            this.styledMapType = payload.styledMapType;
            this.updateDom();
        }
    },
});
