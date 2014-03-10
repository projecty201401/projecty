'use strict';

/* Controllers */

angular.module('pyApp.controllers', ['ui.router', 'pyApp.user', 'pyApp.factories'])
    .controller('ArticleCtrl', ['$stateParams', function($stateParams){

    }])
    .controller('NavCtrl', [
        '$scope',
        'User',
        'PY_APP_CONSTANTS',
        function($scope, User, PY_APP_CONSTANTS) {
            $scope.constants = PY_APP_CONSTANTS;
            $scope.isVisible = false;

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

                // create new User instance and send login information to server
                var user = new User();
                user.data = $scope.user;

                if(!user.data.userEmail) user.data.userEmail = "";
                if(!user.data.userPass) user.data.userPass = "";

                if(user.data)
                    user.api.login(user.data).$promise.then(function(data){
                        $scope.isVisible = true;
                        $scope.user.isLoggedIn = true;
                    }, function(error){
                        console.log(JSON.stringify(error));
                    });
            };
        }])
    .controller('HomeCtrl', ['$scope', 'geolocation', 'article', function($scope, geolocation, article){
        geolocation.getInfoByGeoLoc(function(obj){
            console.log(obj);
            article.get({'q': obj}, function(response, headers){
                $scope.articles = response.results;
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
