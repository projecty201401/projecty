var crypto = require('crypto');

function SessionDAO(db){
    "use strict";

    if ((this instanceof SessionDAO) === false) {
        console.log('Warning: SessionsDAO constructor called without "new" operator');
        return new SessionsDAO(db);
    }

    var sessionColl = db.collection("sessions");

    this.startSession = function(username, callback){
        "use strict";

        // Generate session id
        var currentDate = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var sessionId = crypto.createHash('sha1').update(currentDate + random).digest('hex');

        // Create session doc
        var session = {'_id': sessionId, 'username': username};

        // Insert session doc
        sessionColl.insert(session, function(err, result){
            "use strict";

            callback(err, sessionId);
        });
    };

    this.endSession = function(sessionId, callback){
        "use strict";

        // Remove session doc
        sessionColl.remove({'_id': sessionId}, function(err, numRemoved){
            "use strict";

            callback(err);
        });
    };

    this.getUsername = function(sessionId, callback){
        "use strict";

        if(!sessionId){
            return callback(Error("sessionId not set"), null);
        }

        sessionColl.findOne({'_id': sessionId}, function(err, result){
            if(err) return callback(err, null);
            if(!result){
                return callback(new Error("error: session " + result + "not set"), null);
            }
            callback(null, result.username);
        });
    };
}

module.exports.SessionsDAO = SessionDAO;
