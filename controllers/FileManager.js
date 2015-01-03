/**
 * Created by kevin on 12/15/14.
 */
var _ = require("lodash");
var mongo = require('mongodb');
var async = require('async');
var Grid = require('gridfs-stream');
var fs = require("fs");
// create or use an existing mongodb-native db instance
var server = new mongo.Server('localhost', 27017);
var db = new mongo.Db('gs_test', server, {w:1});
Grid.mongo = mongo;

/**
 * Check the type of the file to see if it meets the types you want
 * @param filename
 * @return {boolean}
 */
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

//TODO: Add the metadata for each file
exports.uploadFile = function (req, res) {
    req.assert('personId', 'Not a number').isInt();
    req.assert('vidTitle', 'This is empty').notEmpty();
    var uploadedFile = req.files.file;
    var typeCheck = checkFileType(uploadedFile.name, ['mp4']) && checkMimeType(uploadedFile.mimetype, 'video/mp4');
    //Does the file meet validation?
    if(!typeCheck){
        return res.json({message: "Your file type is not correct. Upload an MP4."});
    }
    //db.open(function (err) {
    //    var gfs = Grid(db);
    //    var ws = gfs.createWriteStream({
    //        filename: uploadedFile.name,
    //        mode: 'w',
    //        content_type: uploadedFile.mimetype
    //    });
    //    ws.on('close', function (file) {
    //        console.log(file);
    //        db.close();
    //        fs.unlink(uploadedFile.path, function (err) {
    //            if (err) throw err;
    //            console.log('successfully deleted file');
    //        });
    //
    //        res.json({message: "Success!!!"});
    //    });
    //    ws.on('error', function (err) {
    //        db.close();
    //        fs.unlink(uploadedFile.path, function (err) {
    //            if (err) throw err;
    //            console.log('successfully deleted file');
    //        });
    //        res.json({message: "Error, the file you have did not save"});
    //    });
    //    fs.createReadStream(uploadedFile.path).pipe(ws);
    //});
    uploadFileEss(uploadedFile, function (err, result) {
        if(err){
            if (err) throw err;
        }
        else{
            res.json(result);
        }
    })
};

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
            fs.unlink(uploadedFile.path, function (err) {
                if (err) throw err;
                cb(err, file);
            });
        });
        fs.createReadStream(uploadedFile.path).pipe(ws);
    });
};
