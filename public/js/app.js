'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('pyApp', [
    'ngTagsInput',
    'pyApp.newArticle',
    'angular-medium-editor',
    'angularFileUpload',
    'google-maps',
    'ngRoute',
    'ngResource',
    'ui.router',
    'pyApp.factories',
    'pyApp.user',
    'pyApp.filters',
    'pyApp.directives',
    'pyApp.services',
    'pyApp.controllers',
    'pyApp.providers'
]).constant('PY_APP_CONSTANTS', {
      'REGEX_EMAIL': /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}\b/
    }).config([
        'tagsInputConfigProvider',
        '$httpProvider',
        '$stateProvider',
        '$routeProvider',
        '$urlRouterProvider',
        '$locationProvider',
        'geolocationProvider',
        function(tagsInputConfigProvider, $httpProvider, $stateProvider, $routeProvider, $urlRouterProvider, $locationProvider, geolocationProvider) {
            // Set geolocation data
            geolocationProvider.setGeoData();

            // Fn to check if user is logged in, from https://github.com/Anomen/AuthenticationAngularJS
            var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
                // Initialize a new promise
                var dfd = $q.defer();

                // Make an AJAX call to check if the user is logged in
                $http.get('/loggedin').success(function(user){
                    // Authenticated
                    if (user !== '0')
                        $timeout(dfd.resolve, 0);

                    // Not Authenticated
                    else {
                        $rootScope.message = 'You need to log in.';
                        $timeout(function(){dfd.reject();}, 0);
                        $location.url('/');
                    }
                });

                return dfd.promise;
            };

            // Add an interceptor for AJAX errors, deprecated method! http://docs.angularjs.org/api/ng/service/$http
            $httpProvider.responseInterceptors.push(function($q, $location) {
                return function(promise) {
                    return promise.then(
                        // Success: just return the response
                        function(response){
                            return response;
                        },
                        // Error: check the error status to get only the 401
                        function(response) {
                            if (response.status === 401) $location.url('/');
                            return $q.reject(response);
                        }
                    );
                }
            });

            // Configuration of tagsInputConfigProvider
            // http://mbenford.github.io/ngTagsInput/
            tagsInputConfigProvider
                .setDefaults('tagsInput', {
                    placeholder: 'New tag',
                    addOnEnter: true,
                    addOnComma: true,
                    addOnBlur: true,
                    minLength: 2,
                    maxTags: 5
                })
                .setDefaults('autoComplete', {
                    maxResultsToShow: 10,
                    minLength: 1,
                    debounceDelay: 0
                });

            // Routing starts here
            $locationProvider.html5Mode(true);
            $routeProvider.otherwise({redirectTo: '/test'});
            $stateProvider.state('index', {
                url:'/',
                templateUrl:'/partials/home.html',
                controller:'HomeCtrl'
            })
                .state('create', {
                    url:'^/articles/new',
                    templateUrl:'/partials/newArticle.html',
                    controller:'NewArticleCtrl',
                    /*resolve:{
                        loggedin: checkLoggedin
                    }*/
                })
                .state('article', {
                    url:'/article/:id',
                    templateUrl:'/partials/article.html',
                    controller:'ArticleCtrl'
                })
                .state('personal', {
                    url:'/personal',
                    templateUrl:'/partials/personal.html',
                    controller:'PersonalCtrl',
                    /*resolve:{
                        loggedin: checkLoggedin
                    }*/
                })
                .state('logout', {
                    url:'/logout',
                    templateUrl:'/partials/logout.html',
                    controller: 'LogoutCtrl'
                })
                .state('signup', {
                    url:'/signup',
                    templateUrl:'/partials/signup.html',
                    controller:'SignupCtrl'
                })
                .state('profile', {
                    url:'/profile',
                    templateUrl:'/partials/profile.html',
                    controller:'ProfileCtrl',
                    resolve:{
                        loggedin: checkLoggedin
                    }
                })
                .state('profile.account', {
                    templateUrl:'/partials/profile.account.html',
                    controller:'ProfileCtrl',
                    resolve:{
                        loggedin: checkLoggedin
                    }
                })
                .state('profile.tags', {
                    templateUrl:'/partials/profile.tags.html',
                    controller:'ProfileCtrl',
                    resolve:{
                        loggedin: checkLoggedin
                    }
                })
                .state('profile.security', {
                    templateUrl:'/partials/profile.security.html',
                    controller:'ProfileCtrl',
                    resolve:{
                        loggedin: checkLoggedin
                    }
                });
            // Routing ends here

}]).run(['$rootScope', '$http', function($rootScope, $http){
        $rootScope.message = '';

        // Logout function is available on all pages
        $rootScope.logout = function(){
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };
    }]);