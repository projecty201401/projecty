'use strict';

/* Controllers */

angular.module('pyApp.controllers', ['ui.router', 'pyApp.user', 'pyApp.factories'])
    .controller('ArticleCtrl', ['$stateParams', function($stateParams){

    }])
    .controller('NavCtrl', [
        '$rootScope',
        '$scope',
        'User',
        'PY_APP_CONSTANTS',
        function($rootScope, $scope, user, PY_APP_CONSTANTS) {
            $scope.constants = PY_APP_CONSTANTS;
            $scope.isLoggedin = false;

            $scope.getCssClasses = function(ngModelController){
                return {
                    'btn-danger': ngModelController.$invalid && ngModelController.$dirty,
                    'btn-success': ngModelController.$valid && ngModelController.$dirty,
                    'btn-default': !ngModelController.$dirty
                };
            };

            $scope.canSave = function(){
                return $scope.userLogin.$dirty && $scope.userLogin.$valid;
            };

            $scope.showError = function(ngModelController, errorType){
                return ngModelController.$error[errorType];
            };

            $scope.login = function(ev){
                ev.preventDefault();
                ev.stopPropagation();

                console.log($scope.user);

                if(!$scope.user.userEmail) $scope.user.userEmail = "";
                if(!$scope.user.userPass) $scope.user.userPass = "";

                if($scope.user)
                    user.api.login($scope.user).$promise.then(function(data){
                        $rootScope.message = 'Authentication successful.';
                        $rootScope.userEmail = $scope.user.userEmail;
                        $scope.isLoggedin = true;
                    }, function(error){
                        $rootScope.message = 'Authentication failed.';
                        console.log(JSON.stringify(error));
                    });
            };
        }])
    .controller('LogoutCtrl', ['$rootScope', '$scope', '$http', 'User', function($rootScope, $scope, $http, user){
        $scope.userEmail = $rootScope.userEmail;

        // Registering event listener for route change
        $rootScope.logout();
        user.isLoggedin = false;
    }])
    .controller('HomeCtrl', ['$scope', 'geolocation', 'article', function($scope, geolocation, article){
        geolocation.getInfoByGeoLoc(function(obj){
            article.get({'q': obj}, function(response, headers){
                $scope.articles = response.results;
                $('#preloader').hide();
            });
        });
    }])
    .controller('PersonalCtrl', ['$scope', function($scope){
        console.log($scope);
    }])
    .controller('NewArticleCtrl', ['$rootScope', '$scope', 'geolocation', function($rootScope, $scope, geolocation){
        geolocation.getGeoData(function(position){
            $scope.refresh = false;
            $scope.map = {
                center: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                zoom: 15
            };

            $scope.marker = {
                position: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            };

            var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude)
            );

            var input = document.getElementById('searchTextField');
            var options = {
                bounds: bounds,
                types: ['geocode']
            };

            $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
            google.maps.event.addListener($scope.autocomplete, 'place_changed', function(){
                var place = $scope.autocomplete.getPlace();
                console.log(place);
                var a = $scope.marker.position.latitude = $scope.map.center.latitude = place.geometry.location.k;
                var b = $scope.marker.position.longitude = $scope.map.center.longitude = place.geometry.location.A;
                $scope.refresh = true;
                $scope.$digest();
            });

        });
    }])
    .controller('SignupCtrl', ['$scope', function($scope){
        $scope.isVisible = false;

        $scope.canSave = function(){
            return $scope.userSignup.$dirty && $scope.userSignup.$valid;
        };

        $scope.showError = function(ngModelController, errorType){
            return ngModelController.$error[errorType];
        };
    }])
    .controller('ProfileCtrl', [function(){

    }])
    .controller('ArticleCtrl', ['article', '$stateParams', '$scope', function(article, $stateParams, $scope){
        article.get({'id': $stateParams.id}).$promise.then(function(data){
            $scope.articleData = data;
        }, function(err){
            console.log(JSON.stringify(err));
        });
    }]);
