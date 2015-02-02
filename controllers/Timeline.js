/**
 * Created by kevin on 1/12/15.
 */
var oman = require('../general/object_manager');

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
var _ = require('lodash');

Timeline.prototype.createTimeline = function (lastPost, userId, callb) {
    var timelineArr = [];
    var self = this;
    // look through the first postIds

    async.auto({
       get_initial_videos: function (cb) {
           async.each(self.firstVideos,
               // Get the post via postid, and send it into the array
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
                   oman.cleaner.addObj(timelineArr, "norm", function (other) {
                    cb(null,other);
               });
           });
        },
        // Get all of the friend's post
        friend_post: function (cb) {

            gremtool.run(flowrank(time.friend_post(userId).script), function (err, res) {
                //console.log(res);
                oman.cleaner.addObj(res.results, "flow", function (other) {
                    cb(null,other);
                });

            });
        },
        // Get all of the friend of friend post
        friend_of_friend_post: function (cb) {
            gremtool.run(flowrank(time.friend_of_friend_post(userId).script), function (err, res) {
                oman.cleaner.addObj(res.results, "flow", function (other) {
                    cb(null,other);;
                });
            });
        },
        // Get all of the friend's likes post
        friend_like: function (cb) {
            gremtool.run(flowrank(time.friend_like_post(userId).script) , function (err, res) {
                oman.cleaner.addObj(res.results, "flow", function (other) {
                    cb(null,other);
                });
            });

        }
    }, function (err, results) {
        var init = results.get_initial_videos;
        var fof = results.friend_of_friend_post;
        var fpost = results.friend_post;
        var flike = results.friend_like;
        var timeline = _.union(init, fof, fpost, flike);

        callb(timeline);

    })
};

new Timeline().createTimeline(1234, 10242816, function (res) {
    console.log(res);
});

module.exports = new Timeline();




