/**
 * Created by kevin on 1/6/15.
 */
var _ = require("lodash");
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var fs = require("fs");
// create or use an existing mongodb-native db instance
var server = new mongo.Server('localhost', 27017);
var db = new mongo.Db('gs_test', server, {w:1});
Grid.mongo = mongo;

var uploadFileEss = function (uploadedFile, cb) {
    db.open(function (err) {
        var gfs = Grid(db);
        var ws = gfs.createWriteStream({
            filename: uploadedFile.name,
            mode: 'w',
            content_type: uploadedFile.mimetype
        });

        //This is where the file is closed
        ws.on('close', function (file) {
            db.close();
            fs.unlink(uploadedFile.path, function (err) {
                if (err) throw err;
                cb(err, file);
            });

        });

        ws.on('error', function (err) {
            db.close();
            fs.unlink(uploadedFile.path, function (e) {
                if (e) throw e;
                cb(err, "nill");
            });
        });
        fs.createReadStream(uploadedFile.path).pipe(ws);
    });
};

var downloadFileEss = function (fileUUID, responseHeader){
    db.open(function (err) {
        var gfs = Grid(db);
        var options = {
            _id: fileUUID
        };

        var rs = gfs.createReadStream(options);

        rs.on('error', function (err) {
            db.close();
            fs.unlink(uploadedFile.path, function (e) {
                if (e) throw e;
            });
        });

        gfs.exist(options, function (err, found) {
            if (err) return handleError(err);
            found ? rs.pipe(responseHeader) : console.log('File does not exist');
        });



    });
};

var checkFileType = function (filename, fileList) {
    // Get the extention
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(filename)[1];
    if(!Boolean(ext)){
        return false;
    }else{
        return _.contains(fileList, ext);
    }
};

var checkMimeType = function (mimeVal, checkingVal) {
    if(mimeVal === checkingVal){
        return true;
    }return false;
};

module.exports = {
    upload: uploadFileEss,
    fileCheck: checkFileType,
    mimeCheck: checkMimeType
};