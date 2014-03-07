angular.module('pyApp.providers', [])
    .provider('geolocation', function GeolocationProvider(){
        var geoData = {};

        this.$get = ['$http', function geolocationFactory($http){
            var GeolocationServices = function(){
                this.dataObj = {};
                this.geoData = {};
            };

            GeolocationServices.prototype.setGeoData = function(){
                var that = this;
                var dfd = $.Deferred();

                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(function(position){
                        that.geoData = position;
                        dfd.resolve('done loading');
                    }, function(){
                        console.log('No geo service available.');
                        dfd.reject('error loading');
                    });

                    return dfd.promise();
                }

                dfd.reject('no navigator.geolocation');
            };

            GeolocationServices.prototype.getZipCodesByGeoLoc = function(callback){
                var config = {};
                config.url = '/zip/geo';
                config.method = 'GET';
                config.params = {
                    'LAT': this.geoData.coords.latitude,
                    'LONG': this.geoData.coords.longitude
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
                        var err = new Error('Error: GET by geoloc')
                        callback(err, data, status);
                    }
                );
            };

            GeolocationServices.prototype.getZipCodes = function(){
                var that = this;
                $.when(this.setGeoData()).then(function(){
                    that.getZipCodesByGeoLoc(function(err, data, status){
                        if(err){
                            that.getZipCodesByIp(function(err, data, status){
                                if(err) return console.log(err);
                                that.dataObj.data = data;
                                that.dataObj.status = status;
                                return that.dataObj;
                            });
                        }else{
                            that.dataObj.data = data;
                            that.dataObj.status = status;
                            return that.dataObj;
                        }
                    });
                }, function(){
                    that.getZipCodesByIp(function(err, data, status){
                        if(err) return console.log(err);
                        that.dataObj.data = data;
                        that.dataObj.status = status;
                        return that.dataObj;
                    });
                });
            };

            return new GeolocationServices();

        }];
    }
);