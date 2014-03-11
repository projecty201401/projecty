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