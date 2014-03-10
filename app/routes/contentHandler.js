var ArticlesDAO = require('./../articles').ArticlesDAO;
var LocationDAO = require('./../geo').LocationDAO;
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
        var results = [];
        var keys = Object.keys(q);

        keys.sort(function(a, b){
            return LOCATION_KEYS_ARRAY.indexOf(a) - LOCATION_KEYS_ARRAY.indexOf(b);
        });
        async.series([
            function(callback){
                async.each(keys, function(item, callback){
                    var arr = [];

                    if(item === 'postal_code' && q['country']){
                        arr.push(q[item], q['country']);
                    }else{
                        arr.push(q[item]);
                    }

                    articles.getArticlesByLocation(arr, function(err, docs){
                        if(err) return cb(err);
                        docs.forEach(function(el){
                            results.push(el);
                        });
                        callback();
                    });
                }, callback);
            }, function(callback){
                that.removeDuplicateObjectsFromArray(results, '_id', function(err, arr){
                    if(err) return callback(err);
                    results = arr;
                    callback();
                });
            }], function(err){
            if(err) return res.json(500, err);
            res.json(200, {'results': results});
        });
    };

    this.getArticle = function(req, res, next){
        var _id = req.params.id;

        articles.getArticle(_id, function(err, content){
            if(err) return res.json(500, err);
            res.json(200, content);
        });
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
}

module.exports = ContentHandler;
