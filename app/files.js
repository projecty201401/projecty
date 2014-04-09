var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var easyimg = require('easyimage');
var UPLOAD_PATH_SYS = path.normalize(__dirname + '/../public/uploads/');
var UPLOAD_PATH_TAG = '/uploads/';

function FilesDAO(){
    "use strict";

    if((this instanceof FilesDAO) === false){
        console.log('Warning: FilesDAO constructor called without "new" operator');
        return new FilesDAO();
    }

    this.cropCoverImg = function(obj, callback){
        // ToDo: still need to implement check of src?!
        var c = obj.src.split('.').join('_c.');
        console.log(obj);

        easyimg.crop({
            src: UPLOAD_PATH_SYS + obj.src,
            dst: UPLOAD_PATH_SYS + c,
            cropwidth: obj.cropwidth,
            cropheight: obj.cropheight,
            gravity: 'North',
            x: 0,
            y: obj.offsetY
        }, function(err, img){
            if(err) return console.log(err);
            callback(null, {
                path: UPLOAD_PATH_TAG + img.name
            });
        });
    };

    this.saveImage = function(file, imgType, callback){
        var that = this;

        this.defineFileType(file.type, function(err, fileType){
            if(err) return callback(err, null);

            var ext = path.extname(file.originalFilename);
            var shasum = crypto.createHash('sha1').update(file.originalFilename + '_' + new Date()).digest('hex');
            var newFileName = shasum + ext;
            var newPath = path.normalize(UPLOAD_PATH_SYS + newFileName);
            var fileUploadError = new Error("File upload failed.");

            if(!fileType){
                fileUploadError.fileTypeError = true;
                callback(fileUploadError, null);
            }else{
                // define image width according to image type
                var imgWidth = that.defineImgWidth(imgType);

                // image resizing with easyimage + ImageMagick
                easyimg.resize({
                    src: file.path,
                    dst: newPath,
                    width: imgWidth
                }, function(err, img){
                    if(err) return callback(err, null);
                    callback(null, {
                        type: fileType,
                        path: UPLOAD_PATH_TAG + img.name
                    });
                });
            }
        });
    };

    this.defineImgWidth = function(type){
        switch (type){
            case 'cover':
                return 770;
            case 'body':
                return 500;
            default:
                return undefined;
        }
    };

    this.defineFileType = function(ext, callback){
        var err = null;
        var type = null;

        switch(ext){
            case "image/jpeg":
                type = 'photo';
                break;
            case "image/jpg":
                type = 'photo';
                break;
            case "image/png":
                type = 'photo';
                break;
            case "image/gif":
                type = 'photo';
                break;
            case "video/mpg":
                type = 'video';
                break;
            case "video/avi":
                type = 'video';
                break;
            default:
                err = new Error('Data type not supported!');
        }

        callback(err, type);
    };
}

module.exports.FilesDAO = FilesDAO;