var ArticlesDAO = require('./../articles').ArticlesDAO;
var ObjectId = require('mongodb').ObjectID;
var async = require('async');
var path = require('path');

function ContentHandler(db){
    "use strict";

    var articles = new ArticlesDAO(db);

    this.displayMainPage = function(req, res, next){
        "use strict";

/*	if(!req.username){
	    console.log("Could not identify user...redirect to login.");
	    return res.redirect('/login');
	}*/
	
        // bootstrap app with articles
        async.series({
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
        });
    };

    this.getArticle = function(req, res, next){
        var _id = req.params.id;

        articles.getArticle(_id, function(err, content){
            if(err) return res.json(500, err);
            res.json(200, content);
        });
    };
}

module.exports = ContentHandler;
