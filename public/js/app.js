'use strict';

// Declare app level module which depends on filters, and services
angular.module('pyApp', [
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
        '$stateProvider',
        '$routeProvider',
        '$urlRouterProvider',
        '$locationProvider',
        'geolocationProvider',
        function($stateProvider, $routeProvider, $urlRouterProvider, $locationProvider, geolocationProvider) {
            geolocationProvider.setGeoData();
            $locationProvider.html5Mode(true);
            $routeProvider.otherwise({redirectTo: '/test'});
            $stateProvider.state('index', {
                url:'/',
                templateUrl:'partials/home.html',
                controller:'HomeCtrl'
            })
                .state('article', {
                    url:'/article/:id',
                    templateUrl:'partials/article.html',
                    controller:'ArticleCtrl'
                })
                .state('signup', {
                    url:'/signup',
                    templateUrl:'partials/signup.html',
                    controller:'SignupCtrl'
                })
                .state('profile', {
                    url:'/profile',
                    templateUrl:'partials/profile.html',
                    controller:'ProfileCtrl'
                })
                .state('profile.account', {
                    templateUrl:'partials/profile.account.html',
                    controller:'ProfileCtrl'
                })
                .state('profile.tags', {
                    templateUrl:'partials/profile.tags.html',
                    controller:'ProfileCtrl'
                })
                .state('profile.security', {
                    templateUrl:'partials/profile.security.html',
                    controller:'ProfileCtrl'
                });
}]).run([function(){
    }]);