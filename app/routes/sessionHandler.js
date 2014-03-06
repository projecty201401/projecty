var UserDAO = require('./../users').UsersDAO;
var SessionDAO = require('./../sessions').SessionsDAO;

function SessionHandler(db){
    
    var users = new UserDAO(db);
    var sessions = new SessionDAO(db);

    this.isLoggedInMiddleware = function(req, res, next){
	var sessionId = req.cookies.session;
	sessions.getUsername(sessionId, function(err, username){
	    "use strict";
	    
	    if(!err && username){
		req.username = username;
	    }
	    return next();
	});
    };

    this.handleLoginReq = function(req, res, next){
        "use strict";

        console.log(req.body);

        var username = req.body.userEmail;
        var password = req.body.userPass;

        users.validateLogin(username, password, function(err, user){
            "use strict";

            if(err){
                if(err.no_such_user){
                    return res.json(403, {username:username, login_error:err.no_such_user}); // Adapt template!
                }else if (err.invalid_password) {
                    return res.json(403, {username:username, login_error:err.invalid_password}); // Adapt template!
                }else {
                    // Some other kind of error
                    return next(err); // Check what is doing!
                }
            }

            sessions.startSession(user['_id'], function(err, sessionId){
                "use strict";

                if(err) return next(err);

                res.cookie('session', sessionId);

                // send user object from fn users.validateLogin
                res.json(200, user);
            });
        });
    };

    this.checkUserEmail = function(req, res, next){
        "use strict";


        // check if username includes invalid characters
        /*        if(username !== encodeURIComponent(username)){
         err = {invalid_characters: true};
         return callback(err, null);
         }*/

        var email = req.body.userEmail;
        var emailErr = {};
        var Email_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

        if(!email.match(Email_REGEX)){
            emailErr.invalidEmail = true;
            res.json(403, emailErr);
            return;
        }

        users.checkUserEmail(email, function(err, result){
            if(err){
                if(err.isTaken){
                    return res.json(403, err);
                }else{
                    next(err);
                }
            }else if(result){
                res.json(200, result);
            }else{
                next();
            }
        });
    };
}

module.exports = SessionHandler;
