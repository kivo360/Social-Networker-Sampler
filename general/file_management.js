/**
 * Created by kevin on 1/6/15.
 */
var _ = require("lodash");
var fs = require("fs");


var s3 = require('s3');
var uuid = require('node-uuid');

var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: "AKIAJV44Z4IBDJL5VXEQ",
        secretAccessKey: "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"
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    }
});


var uploadFileEss = function (uploadedFile, fileType, cb) {
    var uuidname = "" + uuid.v4() + "." + fileType;
    var uploadParams = {
        localFile: uploadedFile.path,

        s3Params: {
            Bucket: "bubblevid",
            Key: "videos/" + uuidname
        }
    };


    var uploader = client.uploadFile(uploadParams);
    uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
        fs.unlink(uploadedFile.path, function (e) {
            if (e) throw e;
            console.log("done uploading");
            cb(err, "nill");
        });
    });
    uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
        var file = {_id: uuidname};
        fs.unlink(uploadedFile.path, function (err) {
            if (err) throw err;
            console.log("done uploading");
            cb(err, file);
        });
    });
};

var downloadFileEss = function (fileKey, cb){
    var localString =  "./temp/" + fileKey;
    var downloadParams = {
        localFile: localString,

        s3Params: {
            Bucket: "bubblevid",
            Key: "videos/" + fileKey
        }
    };
    var downloader = client.downloadFile(downloadParams);
    downloader.on('error', function(err) {
        console.error("unable to download:", err.stack);
        cb(true, "nill")
    });
    downloader.on('progress', function() {
        console.log("progress", downloader.progressAmount, downloader.progressTotal);
    });
    downloader.on('end', function() {
        console.log("done downloading");
        cb(false, localString);
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
    download: downloadFileEss,
    fileCheck: checkFileType,
    mimeCheck: checkMimeType,
    fs: fs
};