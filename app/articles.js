var ObjectId = require('mongodb').ObjectID;

function ArticlesDAO(db){
    "use strict";

    if ((this instanceof ArticlesDAO) === false) {
        console.log('Warning: ArticlesDAO constructor called without "new" operator');
        return new ArticlesDAO(db);
    }

    var articlesColl = db.collection('articles');

    this.getArticlesByLocation = function(item, obj, callback){
        var query = {};
        query['place.' + item] = obj[item];

        if(obj['country']){
            query['place.country'] = obj['country'];
        }

        articlesColl.find(query).toArray(function(err, docs){
            console.log(docs);
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

    this.getAuthorArticles = function(_authorId, callback){
        var options = {
            'sort': [['lastModified', 'asc']]
        };
        articlesColl.find({'_authorId': _authorId}, options).toArray(function(err, articles){
            if(err) return callback(err, null);
            callback(null, articles);
        });
    };

    this.insertNewArticle = function(article, callback){
        articlesColl.insert({
            _authorId: article._authorId,
            title: article.title,
            titleImg: article.titleImg,
            body: article.body,
            geometry: article.geometry,
            vicinity: article.vicinity,
            place: article.place,
            tags: article.tags,
            lastModified: new Date()
        }, function(err, doc){
            console.log(err);
            if(err) return callback(err, null);
            callback(null, doc[0]);
        });
    };

    this.updateArticle = function(article, callback){
        var _id = new ObjectId(article._id);
        article['$currentDate'] = {
            lastModified: true,
            lastModifiedTS: {$type: 'timestamp'}
        };

        articlesColl.update({'_id': _id}, {safe: true}, function(err, numUpdated){
            if(err) return callback(err, null);
            callback(null, numUpdated);
        });
    };
}

module.exports.ArticlesDAO = ArticlesDAO;