var helpers = {
    getExt: function(urlStr){
	var url = require('url');
	var file =  url.parse(urlStr, true, true).pathname.split("/").pop();
	var ext = file.split(".").pop();
	return ext;
    },
    detMime: function(ext){
	switch(ext){
	    case 'css':
	    return 'text/css';
	    break;
	    
	    case 'html':
	    return 'text/html';
	    break;

	    case 'json':
	    return 'application/json';
	    break;

	    case 'png':
	    return 'image/png';
	    break;

	    case 'jpg':
	    return 'image/jpg';
	    break;

	    default:
	    return 'text/plain';
	}
    },
    setMime: function(req, res, next){
	var ext = helpers.getExt(req.url);
	var mimeType = helpers.detMime(ext);
	res.set({'Content-Type': mimeType});
	next();
    },
    arrToObj: function(arr){
	var obj = {};
	for(var i = 0, len = arr.length; i < len; i++){
	    obj = arr[i];
	}
	return obj;
    }
};

module.exports = helpers;
