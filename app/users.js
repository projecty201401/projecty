var bcrypt = require('bcrypt-nodejs');

// Always connect with db object 
function UsersDAO(db){
    "use strict";
    
    if((this instanceof UsersDAO) === false){
        console.log('please use "new" operator when calling UsersDAO');
        return new UsersDAO(db);
    }

    var usersColl = db.collection("users");

    this.validateLogin = function(username, password, callback){
	"use strict";

        usersColl.findOne({'_id': username}, function validateUserDoc(err, user){
            if(err) return callback(err, null);
            if(user){
                if(bcrypt.compareSync(password, user.password)){ // change to async version!
                    delete user.password;
                    callback(null, user);
                }else{
                    var invalid_password_error = new Error("Invalid password");
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }else{
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        });
    };

    this.checkUserEmail = function(email, callback){
        "use strict";

        var err = {};

        usersColl.findOne({'_id': email}, function(dbError, user){
            if(dbError){
                callback(dbError, null);
            }
            else if(user){
                err.isTaken = true;
                callback(err, null);
            }else{
                callback(null, {isAvailable: true});
            }
        });
    };
}

module.exports.UsersDAO = UsersDAO;
