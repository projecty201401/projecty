var ObjectId = require('mongodb').ObjectID;

function ArticlesDAO(db){
    "use strict";

    if ((this instanceof ArticlesDAO) === false) {
        console.log('Warning: ArticlesDAO constructor called without "new" operator');
        return new ArticlesDAO(db);
    }

    var articlesColl = db.collection('articles');

    this.getArticles = function(callback){
        articlesColl.find().toArray(function(err, docs){
            if(err) return callback(err, null);
            callback(null, docs);
        });
    };

    this.getArticle = function(_id, callback){
        articlesColl.findOne({'_id': new ObjectId(_id)}, function(err, doc){
            if(err) return callback(err, null);
            callback(null, doc);
        });
    };
}

module.exports.ArticlesDAO = ArticlesDAO;