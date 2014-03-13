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
                this.dataObj = {};
                this.googleResultTypes = ['neighborhood','administrative_area_level_2','country','postal_code'];
            }

            GeolocationServices.prototype.getGeoData = function(callback){
                $.when(geoData).done(function(status, position){
                    callback(position);
                });
            };

            GeolocationServices.prototype.formatResultArray = function(err, trigger, obj, data, status, cb){
                if(!err && data.status === 'OK' && data.results){
                    data.results.forEach(function(val){ // ToDo: forEach-functions are blocking!
                        val.address_components.forEach(function(el, index){
                            obj[el.types[0]] = el.long_name;
                        });
                        console.log('trigger: ' + trigger);
                    });
                }
                if(trigger){
                    console.log('callback triggered');
                    cb(obj);
                }
            };

            GeolocationServices.prototype.getInfoByGeoLoc = function(cb){
                var that = this;

                $.when(geoData).done(function(status, position){
                    var counter = 0;
                    var trigger = false;
                    var obj = {};

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
                            'key': 'AIzaSyAuu_IKdrDvud03A9hFlQqkLu03Iu-o2pU', //set as constant
                            'language': 'en'
                        };

                        $http(config)
                            .success(function(data, status){
                                counter++;
                                counter === len ? trigger = true : trigger = false;
                                console.log(data);
                                that.formatResultArray(null, trigger, obj, data, status, cb);
                            })
                            .error(function(data, status){
                                counter++;
                                counter === len ? trigger = true : trigger = false;
                                var err = new Error('Error: GET by geoloc');
                                that.formatResultArray(err, trigger, obj, data, status, cb);
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