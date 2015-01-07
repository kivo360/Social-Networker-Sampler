/**
 * Created by kevin on 12/15/14.
 */


/**
 * General
 */

    var gremtool = require('./../general/gremfunc');
    var async = require('async');
    var social = require('./../config/socialqueries');
/**
 * MongoDb Stuff
 */


var fileio = require('./../general/file_management')

//TODO: Add the metadata for each file
exports.addNewVideo = function (req, res) {
    //req.assert('videoTags', 'Not an array').notEmpty();
    req.assert('post_comment', 'This is empty. Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var uploadedFile = req.files.file;
    // Check for video file
    if(uploadedFile === undefined){
        res.json({message: "You didn\'t add a file"});
    }if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }

    var post_comment = req.param('post_comment');
    var typeCheck = fileio.fileCheck(uploadedFile.name, ['mp4']) && fileio.mimeCheck(uploadedFile.mimetype, 'video/mp4');
    //Does the file meet validation?
    if(!typeCheck){
        return res.json({message: "Your file type is not correct. Upload an MP4."});
    }


    // TODO: Offload this into separate file after for refactor
    async.auto({
            upload_video_file: function (callback) {
                // Uploading the file
                fileio.upload(uploadedFile, function (err, result) {
                    if(err){
                       return res.json({message: "The file could not be uploaded."})
                    }
                    else{
                        callback(null, result);
                    }
                });
            },
            create_post: function (callback) {
                console.log("Create Post About Stuff");
                // Will likely need to add name here
                var post_model = {
                    createdTime: new Date().valueOf(),
                    postComment: post_comment,
                    type: "post"
                };

                gremtool.create(post_model, function(err, result){
                    if(err){
                        return res.json({message: "Error, We couldn't upload the video. Post Not Created"})
                    }
                    callback(null, result.results[0])
                });
            },
            create_video_group: function(callback){
                var video_group_model = {
                    createdTime: new Date().valueOf(),
                    type: "video_group"
                };
                gremtool.create(video_group_model, function(err, result){
                    if(err){
                        return res.json({message: "Error, We couldn't upload the video. Video Group Not Created"})
                    }
                    callback(null, result.results[0])
                });

            },
            add_video_node: ['create_video_group', 'upload_video_file', function (callback, results) {

                console.log(results.upload_video_file);
                var video_model = {
                    createdTime: new Date().valueOf(),
                    video_length: results.upload_video_file.length,
                    videoId: results.upload_video_file._id,
                    type: "video"
                };
                console.log(video_model);
                gremtool.create(video_model, function(err, result){
                    if(err){
                        console.log(err);
                        return res.json({message: "Error, We couldn't upload the video. Video Node Not Added"})
                    }
                    callback(null, result.results[0])
                });

            }],
            user_to_video: ['add_video_node', function (callback, results) {
                // Link the user to the video 'created'
                var videoId = results.add_video_node._id;
                var userId = req.user.userId;
                gremtool.rel(userId, videoId, "recorded", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Cant be a video of the group supplied."});
                    }
                    callback(null, "success");
                });
            }],
            video_to_video_group: ['add_video_node', function (callback, results) {
                // Connect the video_group to the video'
                // TODO: date timestamp (milliseconds) to sequence each video.
                var videoId = results.add_video_node._id;
                var video_groupId = results.create_video_group._id;
                gremtool.rel(videoId, video_groupId, "apartof", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Cant be a video of the group supplied."});
                    }
                    callback(null, "success");
                });
            }],
            user_to_post: ['create_post', function (callback, results) {
                // Connect the user and post together
                var userId = req.user.userId;
                var postId = results.create_post._id;
                gremtool.rel(userId, postId, "posted", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Cant be a video of the group supplied."});
                    }
                    callback(null, "success");
                });
            }],
            video_group_to_post: ['create_post', 'create_video_group', function (callback, results) {
                var video_groupId = results.create_video_group._id;
                var postId = results.create_post._id;
                gremtool.rel(video_groupId, postId, "vg_of", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "All of the videos are added into"});
                    }
                    callback(null, "success");
                });
            }],
            user_to_video_group: ['create_video_group', function(callback, results){
                var userId = req.user.userId;
                var video_groupId = results.create_video_group._id;
                gremtool.rel(userId, video_groupId, "created", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Can\'t connect the video group and user"});
                    }
                    callback(null, "success");
                });
            }]

        }, function (err, results) {
            return res.json({message: "Successfully Added Video", videoId: results.add_video_node._id});
        }
    );


};

exports.downloadVideo = function (req, res) {
    return res.json({message: "This is to download the video"});
};



// Mongo Storage Model
/**
 * {
                _id: "54acabf09b8345244c400b6d",
                filename: "88c7b3dc859c03cca58c523ca4256503.mp4",
                contentType: "video/mp4",
                length: 832221,
                chunkSize: 261120,
                uploadDate: "2015-01-07T03:45:52.914Z",
                md5: "1bc12166f2f5d460c1ee9012b7dec0e3"
                }
 */