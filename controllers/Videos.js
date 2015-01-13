/**
 * Created by kevin on 12/15/14.
 */


/**
 * General
 */

    var gremtool = require('./../general/gremfunc');
    var async = require('async');
    var social = require('./../config/socialqueries');
    var uuid = require('node-uuid');


var fileio = require('./../general/file_management');

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
                fileio.upload(uploadedFile, 'mp4', function (err, result) {
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
                    videoId: results.upload_video_file._id.toString(),
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
            return res.json({message: "Successfully Added Video", videoNode: results.add_video_node, postNode: results.create_post});
        }
    );


};


// TODO: Change to postID instead of video_group
exports.addVideo = function (req, res) {
    req.assert('video_group', 'This is empty. Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var uploadedFile = req.files.file;
    // Check for video file & user
    console.log(uploadedFile);
    if(uploadedFile === undefined){
        res.json({message: "You didn\'t add the video"});
    }
    if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }

    var vgId = req.param('video_group');

    async.auto({
            upload_video_file: function (callback) {
                // Uploading the file
                fileio.upload(uploadedFile, 'mp4', function (err, result) {
                    if(err){
                        return res.json({message: "The file could not be uploaded."})
                    }
                    else{
                        callback(null, result);
                    }
                });
            },
            add_video_node: ['upload_video_file', function (callback, results) {

                var video_model = {
                    createdTime: new Date().valueOf(),
                    videoId: results.upload_video_file._id,
                    type: "video"
                };

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
            check_video_group: function (callback) {
                gremtool.type(vgId, "video_group", function (err, result) {
                    if(err){
                        return res.json({message: "Something went wrong", error: err});
                    }
                    else{
                        callback(null, result)
                    }
                });
            },
            video_to_video_group: ['check_video_group', 'add_video_node', function (callback, results) {
                // Connect the video_group to the video'
                // TODO: date timestamp (milliseconds) to sequence each video.
                var videoId = results.add_video_node._id;
                if(!results.check_video_group.tval){
                    return res.json({message: "Video can not be added to non-existent post"})
                }
                gremtool.rel(videoId, vgId, "apartof", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Cant be a video of the group supplied."});
                    }
                    callback(null, "success");
                });
            }]
        }, function (err, results) {
            return res.json({message: "Successfully Added Video", videoNode: results.add_video_node});
        }
    );

};


// To test download -- '6ebabcc2-737f-47e9-951f-232bdc15f71e.mp4'
exports.downloadVideo = function (req, res) {
    req.assert('video_id', 'Video Id is empty. Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var v_id = req.param('video_id');

    // Begin download here
    fileio.download(v_id, function (err, local) {
        // TODO: Switch to res.sendFile for streaming instead of res.download(fileName, options)

        res.download(local, function (err) {
            if(err){
                console.log(err);
                fileio.fs.unlink(local, function(err, result){
                    console.log("The file was deleted ");
                    return res.json('The file sucks wasn\'t downloaded' )
                })
            }else{
                fileio.fs.unlink(local, function(err, result){
                    console.log("The file was deleted");
                })
            }
        })
    });

};


exports.getVideosByPost = function (req, res) {
    // Check for post id
    req.assert('postId', 'Not a number').notEmpty().isInt();

    var p_id = req.param('postId');
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    async.auto({
        check_post: function (callback) {
            gremtool.type(p_id, "post", function (err, result) {
                if(err){
                    return res.json({message: "Something went wrong on our end", error: err});
                }
                else{
                    callback(null, result)
                }
            });
        },
        videoByPost: ['check_post', function(callback, resu){
            if(!resu.check_post.tval){
                return res.json({message: "Sorry, not a post"})
            }else{
                gremtool.run(social.videos_by_post(p_id), function (err, resuls) {
                    if(err){
                        return res.json({message: "Oops, Something went wrong on our end", error: err});
                    }else{
                        callback(null, resuls)
                    }
                });
            }
        }]

    }, function (err, results) {
         return res.json({results: results.videoByPost.results})
    });
};



//gremtool.run(social.Special.flowrank(social.User.get_friends(10243072).script), function (err, res) {
//    var derp = JSON.stringify(res.results, null, 4);
//    console.log(derp)
//})