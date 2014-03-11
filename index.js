var express = require('express');
//var config = require('./local.config.js');
var app = express();
var routes = require('./app/routes');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/projecty', function(err, db){

    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');

    app.use(express.logger('dev'));

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'py' }));

    app.use('/css', express.static(__dirname + '/public/css'));
    app.use('/js', express.static(__dirname + '/public/js'));
    app.use('/img', express.static(__dirname + '/public/img'));
    app.use('/uploads', express.static(__dirname + '/public/uploads'));
    app.use('/lib', express.static(__dirname + '/public/lib'));
    app.use('/partials', express.static(__dirname + '/public/partials'));

    routes(app, db);

    app.listen(8080);
});
