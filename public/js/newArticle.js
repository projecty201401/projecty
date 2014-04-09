'use strict';

/* Controllers */

angular.module('pyApp.newArticle', ['ui.router', 'pyApp.user', 'pyApp.factories', 'ngResource'])
    .controller('NewArticleCtrl', ['$rootScope', '$scope', 'geolocation', 'article', '$location', '$http',
        function($rootScope, $scope, geolocation, article, $location, $http){
            geolocation.getGeoData(function(position){
                $scope.refresh = false;
                $scope.map = {
                    center: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    },
                    zoom: 15
                };

                $scope.marker = {
                    position: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                };

                var bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude)
                );

                var input = document.getElementById('searchTextField');
                var options = {
                    bounds: bounds,
                    types: ['geocode']
                };

                $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
                google.maps.event.addListener($scope.autocomplete, 'place_changed', function(){
                    var place = $scope.autocomplete.getPlace();
                    console.log(place);
                    var a = $scope.marker.position.latitude = $scope.map.center.latitude = place.geometry.location.k;
                    var b = $scope.marker.position.longitude = $scope.map.center.longitude = place.geometry.location.A;
                    $scope.refresh = true;
                    $scope.$digest();
                });
            });

            $scope.tags = [
                { text: 'test tag' }
            ];

            $scope.loadTags = function(query){
                return $http.get('/tags', {
                    params: {
                        q: query
                    }
                });
            };

            $scope.saveArticle = function(){
                var artObj = {};
                var body = [];
                var articleTag = $('article');
                var place = $scope.autocomplete.getPlace();

                if(articleTag){
                    articleTag.find('p, figure, video').each(function(i, el){

                        // find meditor elements
                        if($(el).data('medium-element')){
                            $(el).find('p').each(function(x, p, a){
                                body.push({
                                    'type': 'text',
                                    'text': p.innerHTML
                                });
                            });

                            // find img elements
                        }else if($(el).find('img').length > 0){
                            body.push({
                                'type': 'image',
                                'path': $($(el).find('img')[0]).attr('src')
                            });

                            // find video tags
                        }else if($(el).prop('tagName') === 'VIDEO'){
                            body.push({
                                'type': 'video',
                                'path': $(el).find('video')[0].attr('src')
                            });
                        }
                    });

                    artObj.body = body;
                    artObj.title = $('#title').text();
                    artObj.titleImg = $('#croppedCoverImg').attr('src');
                    artObj.latlng = $scope.autocomplete.getBounds();
                    artObj.geometry = {
                        type: 'Point',
                        coordinates: [place.geometry.location.k, place.geometry.location.A]
                    };
                    artObj.vicinity = place.vicinity;

                    artObj.place = {};
                    place.address_components.forEach(function(el){
                        artObj.place[el.types[0]] = el.long_name;
                    });

                    artObj.tags = [];
                    $scope.tags.forEach(function(t){
                        artObj.tags.push(t.text);
                    });

                    if($location.path().split('/')[2] === 'new'){
                        article.saveNewArticle(artObj).$promise.then(function(newArticle){
                            $location.path('/articles/' + newArticle._id + '/edit');
                        });
                    }else if($location.path().split('/')[3] === 'edit' && $location.path().split('/')[2].length === 24){
                        artObj._id = $location.path().split('/')[2];
                        article.updateArticle(artObj).$promise.then(function(updatedArticle){
                            console.log(updatedArticle);
                        });
                    }
                }
            };
        }])
    .controller('MediumButtonCtrl', ['$rootScope', '$scope', '$element', '$upload', '$timeout', function($rootScope, $scope, $element, $upload, $timeout){
        var that = this;

        $scope.btnIsVisible = false;
        $scope.menuIsVisible = false;

        $scope.addMedium = function(e){
            $(e.currentTarget).closest('div').find('input').click();
        };

        $scope.toggleBtn = function(e){
            $scope.btnIsVisible = !$scope.btnIsVisible;
            if($scope.menuIsVisible && e.type === 'mouseleave'){
                $scope.toggleMenu();
            }
        };

        $scope.toggleMenu = function(){
            $scope.menuIsVisible = !$scope.menuIsVisible;
        };

        this.bodyImgSuccess = function(data, status, headers, config) {
            // file is uploaded successfully
            var img = $('<img>', {
                src: data.path
            });

            var figure = $('<figure />', {
            });

            figure.append(img);
            $element.after(figure);
            $scope.addEditor();
        };

        this.bodyImgError = function(data, status, headers, config){
            console.log(status);
        };

        $scope.onFileSelect = function($files){
            // by https://github.com/danialfarid/angular-file-upload
            // for-loop if multiple file upload will be implemented at later point
            for(var i = 0, len = $files.length; i < len; i++){
                var file = $files[i];

                if(file !== undefined){
                    $scope.upload = $upload.upload({
                        url: '/imageUpload/body',
                        data: {},
                        file: file
                    })
                        .progress(function(evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        })
                        .success(that.bodyImgSuccess)
                        .error(that.bodyImgError);
                }
            }
        };
    }])
    .controller('CoverImgCtrl', ['$scope', '$upload', '$element', '$http', function($scope, $upload, $element, $http){
        var that = this;

        $scope.coverImgIsVisible = false;
        $scope.cropBtnIsVisible = false;

        $scope.triggerFile = function(){
            $('#inputCoverImage').click();
        };

        this.handleCoverSuccess = function(data, status, headers, config) {
            // file is uploaded successfully
            var img = $('<img>', {
                id: 'coverImg',
                src: data.path,
                border: 0
            });
            img.css('width', '100%'); //check if necessary

            $element.find('#' + $scope.cid).append(img);

            $scope.coverImgIsVisible = !$scope.coverImgIsVisible;
            $scope.cropBtnIsVisible = !$scope.cropBtnIsVisible;

            // wait until image has loaded and then fire crop plugin
            img.on('load', function(){
                var coverImgCtnr = $element.find('#' + $scope.cid);
                var coverImg = $('#croppedCoverImg');

                coverImgCtnr.esRePosition({path: data.path}).then(function(obj){
                    $http.post('/cropCoverImg', obj)
                        .success(function(data, status, headers, config){
                            coverImg.attr('src', data.path);
                            //coverImg.draggable('disable');

                            coverImg.on('load', function(){
                                $scope.$apply(function(){
                                    $scope.coverImgIsVisible = !$scope.coverImgIsVisible;
                                    $scope.cropBtnIsVisible = !$scope.cropBtnIsVisible;
                                });
                            });
                        })
                        .error(function(data, status, headers, config){
                            console.log(status);
                        });
                });
            });
        };

        this.handleCoverError = function(data, status, headers, config){
            console.log(data);
        };

        $scope.onFileSelect = function($files){
            // by https://github.com/danialfarid/angular-file-upload
            // for-loop if multiple file upload will be implemented at later point
            for(var i = 0, len = $files.length; i < len; i++){
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/imageUpload/cover',
                    data: {},
                    file: file
                })
                    .progress(function(evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    })
                    .success(that.handleCoverSuccess)
                    .error(that.handleCoverError);
            }
        };
    }])
    .directive('coverImg', [function(){
        return {
            restrict:'E',
            scope:{
                cid:'@'
            },
            templateUrl:'partials/coverImg.html',
            controller:'CoverImgCtrl',
            link:function(scope, element, attrs){
            }

        };
    }])
    .directive('mediumButton', ['$http', '$compile', '$rootScope', function($http, $compile, $rootScope){
        return {
            restrict:'E',
            scope:true,
            templateUrl:'partials/mediumButton.html',
            controller:'MediumButtonCtrl',
            link:function(scope, element, attrs){
                scope.addEditor = function(){
                    var newScope = $rootScope.$new(true);
                    var comp = $compile('<medium-button></medium-button><p ng-model="description" medium-editor options=\'{"placeholder": "Enter a description", "buttons": ["bold", "italic", "underline", "anchor", "header1", "header2", "quote", "orderedlist", "unorderedlist"]}\'><p/><medium-button></medium-button>')(newScope);
                    element.next().after(comp);
                };
                /*element.find('a').on('click', function(e){
                 angular.element(element.find('input'))[0].click();
                 });*/
            }
        };
    }]);
