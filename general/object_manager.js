/**
 * This file exist to manage all of the general objects and response headers.
 * It will ensure there's some consistency with creating new objects and that all error responses are the same.
 * Will use builder method for functionality
 * Created by kevin on 12/31/14.
 */



var bcrypt = require('bcrypt');
var _ = require('lodash');
var async = require('async');
/***
 * Standardize the response header
 * @param success
 * @constructor
 */
var Response = function (success) {
    this.message = "No Message";
    this.success = success;
    this.rObj = {};
    this.errorcode = ""; // 4 digit error code for faster reading. Will replace message.
};

Response.prototype.setMessage = function (message) {
    this.message = message;
    return this;
};

Response.prototype.responseObject = function (rObj) {
    this.rObj = rObj;
    return this;
};

Response.prototype.setErrorCode = function (eCode) {
    this.errorCode = eCode;
    return this;
};

Response.prototype.done = function (cb) {
    return cb({success: this.success, message: this.message, eCode: this.errorCode, obj: this.rObj});
};

/**
 * Contains all processing types
 * Will use lodash to manipulate all objs added in
 * @constructor
 */
var ObjProcessor = function () {

};

ObjProcessor.prototype = {
    normalRexster: function (obj) {
        // Remove the type key & value
        // _type: 'vertex'
        //console.log(obj)
        return _.omit(obj, '_type');
    },
    flowRexster: function (obj) {
        // Grab the _key, then call call normalRexster
        // Get 0th Object
        // Loop through both keys
        var valArr = [];
        _.forIn(obj[0], function(value, key){
            //console.log(key);
            var rVal = _.omit(value._key, '_type');
            valArr.push(rVal);
            //console.log(rVal);

        });


        return(valArr);
    },
    userRexster: function (obj, cb) {
        // remove the password
    }
};


/**
 * done() will return a object array with all objects having basic information
 * @constructor
 */
var ObjStandard = function () {
    var op = new ObjProcessor();
    this.returnArr = [];

    // Type lookup
    this.processLateral = {
        'norm': op.normalRexster,
        'flow': op.flowRexster,
        'user': op.userRexster,
        'default': op.normalRexster
    };

};




ObjStandard.prototype = {
    /**
     * Runs through given process depending on type
     * @param obj
     * @param type
     * @returns {ObjStandard} -- build array of objects for return
     */
    addObj:function (obj, type, cb) {
        var self = this;
        if(Object.prototype.toString.call( obj ) === '[object Array]'  && type !== "flow"){

            this.arrayProcessing(this.processLateral[type], obj, function (result) {
                // Signal the process is done
                //var value = _.flatten(result);
                cb(result);
            });
        }else if(typeof obj === "object" || type === "flow"){
            this.singleProcessing(this.processLateral[type], obj, function (result) {

                // Signal the process is done
                // Append result to array

                cb(result);
            });
        }

    },
    arrayProcessing: function (process, objArr, cb) {
        // Send each result to array using event emitter
        var total = [];

        async.each(_.uniq(objArr),
            function(item, callback){
                total.push(process(item));
                callback();
            },
            function (err) {
                cb(total);
            });

    },
    singleProcessing: function (process, obj, cb) {
        cb(process(obj));
    }
};


var User = function(){
    this.phoneNum = 3135555555;
    this.password = "dick";
    this.firstName = "Noob";
    this.lastName = "Face";
    this.faceBook = false;
    var self = this;
    this.phone = function (pn) {
        this.phoneNum = pn;
        return this;
    };

    this.pass = function (pass) {

        this.password = pass;
        return this;
    };

    this.first = function (first) {
        this.firstName = first;
        return this;
    };

    this.last = function (last) {
        this.lastName = last;
        return this;
    };

    this.facebook = function (fb) {
        this.faceBook = fb;
        return this;
    };


    this.buildJSON = function (cb) {

        bcrypt.hash(self.password, 10, function(err, hash) {
            if(err) throw err;
            var user = {
                phone: self.phoneNum,
                pass: hash,
                first: self.firstName,
                last: self.lastName,
                facebook:self.faceBook,
                type: "person"
            };
            return cb(user);
        });
    }
};

var Comment = function (text) {
    this.message  = text;
    this.commenter = ""; // The name of the person commenting
};

Comment.prototype.buildJSON = function (cb) {
    var comment = {
        type: "comment",
        ctext: this.message,
        commenter: this.commenter,
        commentTime: new Date().valueOf()
    };
    cb(comment)
};

var Post = function (pc) {
    this.postComment = pc;
    this.geo = [];
};



Post.prototype = {
    setGeo: function (long, lat) {
        this.geo = [long, lat]; // longitude and latitude
        return this;
    },
    buildJSON: function (cb) {
        var post = {
            createdTime: new Date().valueOf(),
            geo: this.geo,
            postComment: this.postComment,
            type: "post"
        };
        cb(post);
    }
};

var Video = function (vidLink) {
    this.videoLink = vidLink;
    this.geo = null;
};

// All of the build functions go here
Video.prototype = {
    setGeo: function (long, lat) {
        this.geo = [long, lat];
    },
    buildJSON: function(cb){
        var video_model = {
            createdTime: new Date().valueOf(),
            videoId: this.videoLink,
            type: "video"
        };
    }
};

module.exports = {
    create: {
        user: User,
        post: Post,
        comment: Comment,
        video: Video,
        video_group: "Video Group Goes Here"
    },
    response: new Response,
    cleaner: new ObjStandard
};



function test(cb){
    // Add callback value here
    var suck = [
        {
            "10242816": {
                "_value": 501,
                "_key": {
                    "uname": "kivo360",
                    "type": "person",
                    "_id": 10242816,
                    "_type": "vertex"
                }
            },
            "12800256": {
                "_value": 5,
                "_key": {
                    "bitchNiggle": "ajkjsjnlk",
                    "type": "person",
                    "_id": 12800256,
                    "_type": "vertex"
                }
            }
        }
    ];

    var dick = [ { uname: 'kivo360', type: 'person', _type: 'vertex', _id: 10242816 },
        { bitchNiggle: 'ajkjsjnlk', type: 'person', _type: 'vertex', _id: 12800256 } ];


    var obj = new ObjStandard();
    obj.addObj(suck, 'flow', function (value) {
        console.log(value);
    });

    obj.addObj(dick, 'norm', function (value) {
        console.log(value);
    });

}

