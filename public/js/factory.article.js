angular.module('pyApp.factories', ['ngResource'])
    .factory('article', ['$resource', function($resource){
        return $resource('/articles/:id', {'id': '@all'}, {});
    }]);