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
    .directive('mediumEditor', ['$rootScope', function ($rootScope) { // currently not in use
        // by https://github.com/thijsw/angular-medium-editor
        return {
            require: 'ngModel',
            restrict: 'AE',
            link: function (scope, iElement, iAttrs, ctrl) {
                angular.element(iElement).addClass('angular-medium-editor');
                // Parse options
                var opts = {};
                if (iAttrs.options) {
                    opts = angular.fromJson(iAttrs.options);
                }
                var placeholder = opts.placeholder || 'Type your text';
                var onChange = function () {
                    scope.$apply(function () {
                        // If user cleared the whole text, we have to reset the editor because MediumEditor
                        // lacks an API method to alter placeholder after initialization
                        if (iElement.html() == '<p><br></p>') {
                            opts.placeholder = placeholder;
                            var editor = new MediumEditor(iElement, opts);
                        }
                        ctrl.$setViewValue(iElement.html());
                    });
                };
                // view -> model
                iElement.on('blur', onChange);
                iElement.on('input', onChange);
                // model -> view
                ctrl.$render = function () {
                    if (!editor) {
                        // Hide placeholder when the model is not empty
                        if (!ctrl.$isEmpty(ctrl.$viewValue)) {
                            opts.placeholder = '';
                        }
                        var editor = new MediumEditor(iElement, opts);
                    }
                    iElement.html(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
                };
            }
        };
    }]);
