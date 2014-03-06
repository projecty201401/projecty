angular.module('pyApp.article', ['ngResource']).
    factory('Article', ['$resource', function($resource){
        return function(){
            this.api = $resource('/article/:id', {}, {});
        };
    }]);