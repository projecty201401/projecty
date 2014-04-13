'use strict';

/* Directives article */

angular.module('pyApp.directives', []).
    directive('articlepreview', function($compile) {
        return {
            transclude:true,
            restrict:'E',
            scope:{
            },
            templateUrl: 'partials/articlePreview.html',
            link: function(scope, element, attrs){
            }
        };
    }).
    directive('loginformhome', function(){ // in use?
    return {
        restrict:"E",
        scope:{
        },
        templateUrl:'partials/loginFormHome.html'
    };
    }).directive('ngUniqueEmail', ['$http', function($http){
        return {
            require:'ngModel',
            restrict:'A',
            link: function(scope, elem, attrs, ctrl){
                scope.busy = false; // if icon is included
                ctrl.$parsers.push(function(newVal){
                    // hide old error messages
                    ctrl.$setValidity('isTaken', true);
                    ctrl.$setValidity('invalidEmail', true);

                    if (!newVal) {
                        // don't send undefined to the server during dirty check
                        // empty username is caught by required directive
                        return;
                    }

                    // show spinner
                    scope.busy = true;

                    // send request to server
                    $http.post('/signup/check/useremail', {userEmail: newVal})
                        .success(function(data) {
                            // everything is fine -> do nothing
                            scope.busy = false;
                        })
                        .error(function(data) {

                            // display new error message
                            if (data.isTaken) {
                                ctrl.$setValidity('isTaken', false);
                            } else if (data.invalidChars) {
                                ctrl.$setValidity('invalidEmail', false);
                            }

                            scope.busy = false;
                        });
                });
            }
        };
    }])
    .directive('ngArticle', [function(){
    }])
    .directive('ngLogout', ['$rootScope', function($rootScope){
        return {
            require:'?form',
            link: function(scope, el, attrs, ctrl){
                $rootScope.$on('$stateChangeSuccess', function(ev, currentState, currentParams){
                    if(currentState.url === '/logout'){
                        scope.user.userEmail = "";
                        scope.user.userPass = "";
                        scope.isLoggedin = false;
                    }
                });
            }

        };
    }])
    .directive('authorArticle', [function(){
        return {
            transclude: true,
            restrict: 'A',
            scope: {

            },
            controller: ['$scope', '$element', '$attrs', '$transclude',
                function($scope, $element, $attrs, $transclude){

            }],
            link: function(scope, element, attrs, ctrl){
                element.attr('draggable', 'true');
                element.draggable({
                    revert: 'invalid',
                    helper: 'clone'
                });
            }
        };
    }])
    .directive('authorCollection', [function(){
        return {
            restrict: 'A',
            scope: {

            },
            controller: ['$scope', '$element', '$attrs', '$transclude',
                function($scope, $element, $attrs, $transclude){

                }],
            link: function(scope, element, attrs, ctrl){
                element.droppable({
                    accept: '.authorArticle'
                });
            }
        };
    }]);