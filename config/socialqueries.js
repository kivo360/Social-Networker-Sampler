/**
 * Created by kevin on 1/3/15.
 */
var grex = require('grex');

/**
 * Setup grex here
 * TODO: Figure Out Timeline Functionality.
 * MODO: Capturing Life Together in Fun New Ways
 *
 **/

var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;
var _ = grex._;
var gremtool = require('./../general/gremfunc');
var q = gremlin();





//console.log()


module.exports = {

    // The user queries
    User: {
        // Will transition to ingroup and outgroup
        get_friends: function (id) {
            // Check type
            // Will need to use server script to get working
            // .and(_().both("friend"),_().both('friend').both("friend")
            var query = gremlin(g.v(id).both("friend"));
            return query;
        },
        // For inner circle
        likes_by_user: function (id) {
            // What does this person like?
            // Check type: must be user.
            var query = gremlin(g.v(id).out('like'));
            return query;
        },
        get_user_by_post: function (id) {
            // From Post gets the video_group, then videos, then users from the videos
            var query = gremlin();
            query(g.v(id).in('posted'));
            return query;
        },
        // Who added on this video post
        contributors_by_post: function (postId) {
            var query = gremlin();
            // g.v(10242816).both('friend').out('recorded').out('apartof').out('vg_of')
            query(g.v(postId).in('vg_of').in('apartof').in('recorded'));
            return query;
        }
    },
    Special: {
        flowrank: function (queryString) {
            // Must be a string
            if(typeof queryString !== "string"){
                return;
            }else{
                var query = gremlin();
                query('c=0');
                query('m=[:]');
                query('vx = ' +  queryString);
                query("vx.as('x').groupCount(m).loop('x'){c++ < 500}.iterate()");
                query("m.sort{a,b -> b.value <=> a.value}[0..4]");
                //query('m')
                return query;
            }
        }
    },
    Timeline: {
        friend_post: function (userId) {
            var query = gremlin();
            // TODO: change friend query to match correct type of friends list
            // g.v(10242816).both('friend').out('recorded').out('apartof').out('vg_of')
            query(g.v(userId).both('friend').out('recorded').out('apartof').out('vg_of'));
            return query;
        },
        friend_of_friend_post: function (userId) {
            var query = gremlin();
            query(g.v(userId).both('friend').both('friend').out('recorded').out('apartof').out('vg_of'));
            return query;
        },
        friend_like_post: function(userId){
            var query = gremlin();
            // .has('type', 'T.eq', 'post')
            query(g.v(userId).both('friend').out('like'));
            return query;
        }
    },
    // Who liked this item?
    get_likers: function (id) {
        // Check type: can't be user
        var query = gremlin(g.v(id).in('like'));
        return query;
    },

    // Get comments from the item (i.e post, other comments, maybe pages...)
    get_comments: function (itemid) {
        // Check type: can't be user
        var query = gremlin(g.v(itemid).out('commentof'));
        return query;
    },
    // Find everything the user commented on. Nice to have, but not necessary
    comments_by_user: function (userid) {
        // Check type: must be user
        var query = gremlin(g.v(userid).out('commented'));
        return query;
    },
    // Post by user. Useful for profile page, but don't really need one right now.
    post_by_user: function (id) {
        // Check type: must be user
        var query = gremlin(g.v(id).out('posted'));
        return query;
    },
    // Finds all videos connected to post. Good for the download list
    videos_by_post: function (postId) {
        var query = gremlin();
        query(g.v(postId).in('vg_of').in('apartof'));
        return query;
    }

};