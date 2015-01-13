/**
 * Created by kevin on 1/12/15.
 */


var Timeline = function () {
    // set the initial post ids for user's time line.
    // This is so the user can have something before they follow or get friends
    this.firstVideos = [12802816, 12803584, 12806400];
};

var gremtool = require('./../general/gremfunc');
var async = require('async');
var social = require('./../config/socialqueries');
var time = social.Timeline;
var flowrank = social.Special.flowrank;

Timeline.prototype.createTimeline = function (lastPost, userId, callb) {
    var timelineArr = [];
    var self = this;
    // look through the first postIds

    async.auto({
       get_initial_videos: function (cb) {
           async.each(self.firstVideos,
               // Get the post viea postid, and send it into the array
               function (postId, callback) {
                   //console.log(postId);
                   gremtool.findById(postId, function (err, res) {
                       if(err){
                            console.log('ignoring ... ');
                            callback()
                       }else{
                            //console.log(res);
                            timelineArr.push(res.results[0]);
                            callback()
                       }

                   });


           }, function(err){
               cb(null, timelineArr);
           });
        },
        // Get all of the friend's post
        friend_post: function (cb) {

            gremtool.run(flowrank(time.friend_post(userId).script), function (err, res) {
                //console.log(res);
                cb(null, res);
            });
        },
        // Get all of the friend of friend post
        friend_of_friend_post: function (cb) {
            gremtool.run(flowrank(time.friend_of_friend_post(userId).script), function (err, res) {
                //console.log(res);
                cb(null, res);
            });
        },
        // Get all of the friend's likes post
        friend_like: function (cb) {
            gremtool.run(flowrank(time.friend_like_post(userId).script) , function (err, res) {
                //console.log(res);
                cb(null, res);
            });

        }
    }, function (err, results) {
        //console.log(results);
        callb(results);
        //console.log(timelineArr)
    })
};

new Timeline().createTimeline(1234, 10242816, function (res) {
    console.log(res);
});

module.exports = new Timeline();




