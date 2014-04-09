var SessionHandler = require('./sessionHandler');
var ContentHandler = require('./contentHandler');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//add error handler?

module.exports = exports = function(app, db){

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);

    // ====================================================================

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(
        {
            usernameField:'userEmail',
            passwordField:'userPass'
        },
        function(username, password, done){
            sessionHandler.handleLoginReq(username, password, function(status, err, user, sessionId){
                if(err) return done(err);
                else if(!user){
                    return done(null, false, {message: 'Incorrect username.'});
                }else if(!sessionId){
                    return done(null, false, {message: 'No sessionId obtained.'});
                }
                return done(null, user);
            });
        })
    );

    passport.serializeUser(function(user, done) {
        console.log('serialize');
        console.log(user);
        done(null, user);
    });

    passport.deserializeUser(function(_id, done) {
        console.log('deserialize');
        done(null, _id);
    });

    var auth = function(req, res, next){
        if(!req.isAuthenticated()) res.send(401);
        else next();
    };

    //=======================================================

    // Middleware to check login status!
//    app.use(sessionHandler.isLoggedInMiddleware);

    // Render main page
    app.get('/', contentHandler.displayMainPage);

    // article routes
    app.get('/articles', contentHandler.getArticlesByLocation);
    app.get('/articles/:id', contentHandler.getArticle);
    app.post('/articles/new', contentHandler.insertNewArticle);
    app.put('/articles/:id/edit', contentHandler.updateArticle);

    // Login and logout
    app.get('/loggedin', function(req, res, next){
        res.send(req.isAuthenticated() ? req.user : '0');
    });
    app.post('/login', passport.authenticate('local'), function(req, res, next){
        res.send(req.user);
    });
    app.post('/logout', function(req, res, next){
        req.logOut();
        res.send(200);
    });

    // signup including checks
    app.post('/signup/check/useremail', sessionHandler.checkUserEmail);

    // geolocation lookup
    app.get('/zip/geo', contentHandler.getGeolocation);
    // route for /zip/ip

    // file upload
    app.post('/imageUpload/:type', contentHandler.saveImage);
    app.post('/cropCoverImg', contentHandler.cropCoverImg);

    // tags
    app.get('/tags', contentHandler.getTags);
    // Others
    app.post('*', function(req, res, next){
        console.log(req);
    });
};
