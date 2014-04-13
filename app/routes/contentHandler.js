var ArticlesDAO = require('./../articles').ArticlesDAO;
var LocationDAO = require('./../geo').LocationDAO;
var FilesDAO = require('./../files').FilesDAO;
var TagsDAO = require('./../tags').TagsDAO;
var ObjectId = require('mongodb').ObjectID;
var async = require('async');
var path = require('path');
var LOCATION_KEYS_ARRAY = ['neighborhood', 'sublocality'
    , 'postal_code', 'locality', 'administrative_area_level_1', 'country'];

function ContentHandler(db){
    "use strict";

    var that = this;
    var articles = new ArticlesDAO(db);
    var location = new LocationDAO(db);
    var files = new FilesDAO(db);
    var tags = new TagsDAO(db);

    this.displayMainPage = function(req, res, next){
        "use strict";

        console.log(req.connection.remoteAddress);

/*	if(!req.username){
	    console.log("Could not identify user...redirect to login.");
	    return res.redirect('/login');
	}*/

        res.set({'Content-Type': 'text/html'});
        res.render('index');

        // bootstrap app with articles
/*        async.series({
            firstCall: function(callback){
                articles.getArticles(function(err, docs){
                    if(err) return callback(err, null);
                    callback(null, docs);
                });
            }
        }, function(err, results){
            if(err) return res.json(500, err);
            res.set({'Content-Type': 'text/html'});
            res.render('index', {'articles': JSON.stringify(results)});
        });*/
    };

    this.getArticlesByLocation = function(req, res, next){
        var q = JSON.parse(req.query.q);
        var articlesByLoc = [];
        var keys = Object.keys(q);

        keys.sort(function(a, b){
            return LOCATION_KEYS_ARRAY.indexOf(a) - LOCATION_KEYS_ARRAY.indexOf(b);
        });
        async.series([
            function(callback){
                async.each(keys, function(item, callback){
                    articles.getArticlesByLocation(item, q, function(err, docs){
                        if(err) return callback(err);
                        docs.forEach(function(el){
                            articlesByLoc.push(el);
                        });
                        callback();
                    });
                }, callback);
            }, function(callback){
                that.removeDuplicateObjectsFromArray(articlesByLoc, '_id', function(err, arr){
                    if(err) return callback(err);
                    articlesByLoc = arr;
                    callback();
                });
            }], function(err){
            if(err) return res.json(500, err);
            res.json(200, {'results': articlesByLoc});
        });
    };

    this.getArticle = function(req, res, next){
        var _id = req.params.id;

        articles.getArticle(_id, function(err, content){
            if(err) return res.json(500, err);
            res.json(200, content);
        });
    };

    this.getAuthorArticles = function(req, res, next){
        console.log(req.query);
        articles.getAuthorArticles(req.query._authorId, function(err, articles){
            if(err) return res.json(500, err);
            res.json(200, {articles: articles});
        });
    };

        this.insertNewArticle = function(req, res, next){
        articles.insertNewArticle(req.body, function(err, doc){
            if(err) return res.json(500, err);
            res.json(200, doc);
        });

        tags.insertNewTags(req.body.tags);
    };

    this.updateArticle = function(req, res, next){
        articles.updateArticle(req.body, function(err, numUpdated){
            if(err) return res.json(500, err);
            res.json(200, {'numUpdated': numUpdated});
        });

        tags.insertNewTags(req.body.tags);
    };

    this.getGeolocation = function(req, res, next){
        var position = {
            'lat': req.query.lat,
            'long': req.query.long
        };

        location.getGeolocation(position, function(err, locations){
            if(err) return res.json(403, err);
            res.json(200, locations);
        });
    };

    // not needed right now
    this.removeDuplicateObjectsFromArray = function(arr, id, callback){
        // Remove dublicates from array
        for(var i = 0, len = arr.length; i < len; i++){
            for(var x = i + 1; x < len; x++){
                if(arr[i] && arr[x]){
                    if(arr[i][id].toString() === arr[x][id].toString()){
                        delete arr[x];
                    }
                }
            }
        }

        // Remove undefined fields from array
        arr = arr.filter(function(el){
            return (typeof el !== 'undefined');
        });

        callback(null, arr);
    };

    this.cropCoverImg = function(req, res, next){
        files.cropCoverImg(req.body, function(err, obj){
	    if(err) return res.json(500, err);
            res.json(200, obj);
        });
    };

    this.saveImage = function(req, res, next){
        files.saveImage(req.files.file, req.params.type, function(err, obj){
	    console.log(obj);
            if(err) return res.json(500, err);
            res.json(200, obj);
        });
    };

    this.getTags = function(req, res, next){

        // escape user input before regex
        // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex/6969486#6969486
        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        var q = escapeRegExp(req.query.q);
        tags.getTags(q, function(err, tags){
            if(err) return res.json(200, err);
            res.json(200, tags);
        });
    };
}

module.exports = ContentHandler;
