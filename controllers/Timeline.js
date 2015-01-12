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

Timeline.prototype.createTimeline = function (lastDownloaded, lastPost, cb) {
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
               cb(null);
           });
        },
        user_ingroup_post: function () {
            // Get all of the friend of friend's post
                // send query togroovy
                // run through eigenvector centrality
                // Get top 5 results
        },
        user_outgroup_post: function () {
            // Get all of the friend outgroup post
                // send query togroovy
                // run through eigenvector centrality
                // Get top 5 results
        },
        friend_of_friend_post: function () {
            // Get all of the friend of friend's post
                // send query togroovy
                // run through eigenvector centrality
                // Get top 5 results
        },
        friend_like: function () {
            // get all of what the friend likes

        }
    })
};



new Timeline().createTimeline(1234, 4567);


