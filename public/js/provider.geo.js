angular.module('pyApp.providers', [])
    .provider('geolocation', function GeolocationProvider(){
        var geoData = {};
        var sensor = false;

        this.setGeoData = function(){
            var dfd = $.Deferred(); // change to AngularJS built-in $q

            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    sensor = true;
                    dfd.resolve('done loading', position);
                }, function(){
                    console.log('No geo service available.');
                    dfd.reject('error loading');
                });

                return geoData = dfd.promise();
            }
            dfd.reject('no navigator.geolocation');
        };

        this.$get = ['$http', function geolocationFactory($http){
            function GeolocationServices(geoData){
                var that = this;
                this.dataObj = {};
                this.googleResultTypes = ['neighborhood','administrative_area_level_2','country','postal_code'];
            }

            GeolocationServices.prototype.getInfoByGeoLoc = function(callback){

                // ToDo: based on result array (keywords/tags) make call to server
                // ToDo: based on result array sent to server find articles in db
                // ToDo: sort articles according to predefined algorithm and return them

                var that = this;

                $.when(geoData).done(function(status, position){
                    for(var i = 0, len = that.googleResultTypes.length; i < len; i++){
                        that.geoData = position;
                        var config = {};
                        config.url = 'https://maps.googleapis.com/maps/api/geocode/json'; // possible to factor out json and put it in params object?
                        config.method = 'GET';
                        config.params = {
                            'latlng': that.geoData.coords.latitude
                                + ',' + that.geoData.coords.longitude,
                            //'location_type': 'ROOFTOP',
                            'result_type': that.googleResultTypes[i],
                                'sensor': true, //set in provider
                            'key': 'AIzaSyAuu_IKdrDvud03A9hFlQqkLu03Iu-o2pU' //set as constant
                        };

                        $http(config)
                            .success(function(data, status){
                                callback(null, data, status);
                            })
                            .error(function(data, status){
                                var err = new Error('Error: GET by geoloc')
                                callback(err, data, status);
                            }
                        );
                    }
                });
            };

            GeolocationServices.prototype.getZipCodesByIp = function(callback){
                var config = {};
                config.url = '/zip/ip';
                config.method = 'GET';

                $http(config)
                    .success(function(data, status){
                        callback(null, data, status);
                    })
                    .error(function(data, status){
                        var err = new Error('Error: GET by geoloc');
                        callback(err, data, status);
                    }
                );
            };

            return new GeolocationServices(geoData);
        }];
    }
);