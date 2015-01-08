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

module.exports = {
    get_friends: function (id) {
        // Check type
        var query = gremlin(g.v(id).and(_().out("friend"), _().out('friend').out("friend")));
        return query;
    },
    get_likers: function (id) {
        // Check type: can't be user
        var query = gremlin(g.v(id).in('like'));
        return query;
    },
    likes_by_user: function (id) {
        // What does this person like?
        // Check type: must be user.
        var query = gremlin(g.v(id).out('like'));
        return query;
    },
    get_comments: function (id) {
        // Check type: can't be user
        var query = gremlin(g.v(id).in('commentof'));
        return query;
    },
    comments_by_user: function (userid) {
        // Check type: must be user
        var query = gremlin(g.v(userid).out('commented'));
        return query;
    },
    post_by_user: function (id) {
        // Check type: must be user
        var query = gremlin(g.v(id).out('post'));
        return query;
    },
    user_by_post: function (id) {
        // Check type: must be user
        var query = gremlin(g.v(id).in('post'));
        return query;
    },
    post_videos: function (id) {
        // Check type: must be post
        var query = gremlin(g.v(id).out('video_group').out('video'));
        return query;
    },
    get_users_by_post: function (id) {
        // From Post gets the video_group, then videos, then users from the videos
        var query = gremlin();
        query(g.v(id).out('video_group').out('video').out('created'));
        return query;
    },
    get_videos_by_post: function (postId) {
        var query = gremlin();
        query(g.v(postId).in('vg_of').in('apartof'))
        return query;
    }

    //Timeline = Randomize sending to mongo

};