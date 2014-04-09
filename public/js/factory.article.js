'use strict';

angular.module('pyApp.factories', ['ngResource'])
    .factory('article', ['$resource', function($resource){
        return $resource('/articles/:id/:action', {}, {
            saveNewArticle: {
                method: 'POST',
                params: {
                    action: 'new'
                }
            },
            updateArticle: {
                method: 'PUT',
                params: {
                    id: '@_id',
                    action: 'edit'
                }
            }
        });
    }]);