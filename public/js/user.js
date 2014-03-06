angular.module('pyApp.user', ['ngResource']).factory('User', ['$resource', function($resource){
    return function(){
        this.isLoggedIn = false;
        this.api = $resource('/login', {}, {
            login: {
                method: 'POST'
            }
        });
    };
}]);