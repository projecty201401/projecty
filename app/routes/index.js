var SessionHandler = require('./sessionHandler');
var ContentHandler = require('./contentHandler');
//add error handler?

module.exports = exports = function(app, db){

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);
    
    // Middleware to check login status!
//    app.use(sessionHandler.isLoggedInMiddleware);

    // Render main page
    app.get('/', contentHandler.displayMainPage);

    // article routes
    app.get('/article/:id', contentHandler.getArticle);

    // Login and logout
//    app.get('/logout', TCC.logout);
    app.post('/login', sessionHandler.handleLoginReq);

    // signup including checks
    app.post('/signup/check/useremail', sessionHandler.checkUserEmail);

    // geolocation lookup
    app.get('/zip/geo', contentHandler.getGeolocation);
    // route for /zip/ip

    // Others
    app.post('*', function(req, res, next){
        console.log(req);
    });
};
