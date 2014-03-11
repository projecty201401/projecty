angular.module('pyApp.user', ['ngResource']).service('User', ['$resource', function($resource){
    this.isLoggedin = false;
    this.api = $resource('/login', {}, {
        login: {
            method: 'POST'
        }
    });
}]);