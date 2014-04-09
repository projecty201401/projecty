var ObjectId = require('mongodb').ObjectID;
var async = require('async');

function TagsDAO(db){
    "use strict";

    if ((this instanceof TagsDAO) === false) {
        console.log('Warning: TagsDAO constructor called without "new" operator');
        return new TagsDAO(db);
    }

    var tagsColl = db.collection('tags');

    this.getTags = function(q, callback){
        var regexTagExpr = '^' + q + '.*';
        var regexTag = new RegExp(regexTagExpr, 'i');
        console.log(regexTag);
        tagsColl.find({'tagName': {'$regex': regexTag}}).toArray(function(dbErr, tags){
            if(dbErr) return callback(dbErr, null);

            function iterator(item, cb){
                if(!item.tagName) return cb(new Error('no such item'), null);
                cb(null, item.tagName)
            }

            async.map(tags, iterator, function(mapError, results){
                if(mapError) return callback(mapError, null);
                callback(null, results);
            });
        });
    };

    this.insertNewTags = function(tags){
        try{
            if(tags.length >= 1){
                tags.forEach(function(tag){
                    console.log(tag);
                    tagsColl.update({'tagName': tag}, {'tagName': tag}, {'upsert': true}, function(errDb, numUpdated){
                        console.log(numUpdated);
                    });
                });
            }
        }catch(err){
            console.log(err);
        }
    };
}

module.exports.TagsDAO = TagsDAO;