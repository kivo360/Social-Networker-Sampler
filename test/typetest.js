/**
 * Created by kevin on 1/5/15.
 */

var async = require('async');

async.auto({
    upload_video_file: function (callback) {
        // Uploading the file
        console.log("upload the video file");
        callback(null, 'video_file');
    },
    create_post: function (callback) {
        console.log("Create Post About Stuff");
        callback(null, 'Add Post');
    },
    check_for_user: function (callback) {
        callback(null, 'user does exist || doesn\'t exist');
    },
    create_video_group: function(callback){
        callback(null, 'video_group')
    },
    add_video_node: ['create_video_group', 'upload_video_file', function (callback, results) {
        console.log("Creating the video");
        callback(null, 'video_node');
    }],
    video_to_user: ['add_video_node', 'check_for_user', function (callback, results) {
        // Link the user to the video 'created'
        callback(null, 'link_id');
    }],
    video_to_video_group: ['add_video_node', function (callback, results) {
        // Connect the video_group to the video'
        // TODO: date timestamp (milliseconds) to sequence each video.
        console.log("Linking video to video_group");
        callback(null, 'isDone');
    }],
    post_to_user: ['create_post', 'check_for_user', function (callback, results) {
        // Connect the user and post together
        callback(null, 'isDone');
    }],
    video_group_to_post: ['create_post', 'create_video_group', function (callback, results) {
        callback(null, 'isDone');
    }]

}, function (err, results) {
    console.log("Err: ", err);
    console.log('results = ', results.create_post);
});