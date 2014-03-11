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
            console.log(obj);
            article.get({'q': obj}, function(response, headers){
                $scope.articles = response.results;
                $('#preloader').hide();
            });
        });
    }])
    .controller('PersonalCtrl', ['$scope', function($scope){
        console.log($scope);
    }])
    .controller('NewArticleCtrl', ['$rootScope', '$scope', function($rootScope, $scope){
        console.log($scope);
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
