function LocationDAO(db){
    "use strict";

    if((this instanceof LocationDAO) === false){
        console.log('Warning: LocationDAO constructor called without "new" operator');
        return new LocationDAO(db);
    }

    var locationColl = db.collection('zip');

    this.getGeolocation = function(position, callback){
        console.log(position.lat, position.long);
        var b = 0.01;
        var latBottom = Math.round(parseFloat(position.lat)*100)/100 - b;
        var latUpper = Math.round(parseFloat(position.lat)*100)/100 + b;
        var longBottom = Math.round(parseFloat(position.long)*100)/100 - b;
        var longUpper = Math.round(parseFloat(position.long)*100)/100 + b;

        console.log(latBottom, latUpper, longBottom, longUpper);

        locationColl.find({'LAT': {'$gt': latBottom, '$lt': latUpper},
            'LONG': {'$gt': longBottom, '$lt': longUpper}}).toArray(function(err, docs){
                if(err) return callback(err, null);
                console.log(docs);
                callback(null, docs);
            });
    };
}

module.exports.LocationDAO = LocationDAO;