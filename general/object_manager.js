/**
 * This file exist to manage all of the general objects and response headers.
 * It will ensure there's some consistency with creating new objects and that all error responses are the same.
 * Will use builder method for functionality
 * Created by kevin on 12/31/14.
 */



var bcrypt = require('bcrypt');
var _ = require('lodash');

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
    normalRexster: function (obj, cb) {
        // Remove the type key & value
        // _type: 'vertex'
        cb.call(this, _.omit(obj, '_type'));
        return this;
    },
    flowRexster: function (obj, cb) {
        // Grab the _key, then call call normalRexster
        // Get 0th Object
        // Loop through both keys

        _.forIn(_.first(obj), function(value, key){

        });

        cb.call(this, _.omit(obj, '_type'));


        return this;
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
        'nRex': 'Normal Rexster',
        'frRex': 'Flowrank Rexster',
        'userRex': 'User Rexster Response',
        'default': 'Normal Rexster'
    };
};

/**
 * Runs through given process depending on type
 * @param obj
 * @param type
 * @returns {ObjStandard}
 */
ObjStandard.prototype.addObj = function (obj, type) {


    if(typeof obj === "array" && type !== "frRex"){
        this.arrayProcessing(this.processLateral[type], obj, function (result) {
            // Signal the process is done
            return this;
        });
    }else if(typeof obj === "object"){

        this.singleProcessing(this.processLateral[type], obj, function (result) {
            // Signal the process is done
            return this
        });
    }

};

ObjStandard.prototype.arrayProcessing = function (process, obj, cb) {
    // Send each result to array using event emitter
    // process()
};

ObjStandard.prototype.singleProcessing = function (process, obj, cb) {

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

module.exports = {
    create: {
        user: User,
        post: "Post Object Goes Here",
        comment: "Comment Object Goes Here",
        video: "Video Goes Here",
        video_group: "Video Group Goes Here"
    },
    response: Response,
    cleaner: ObjStandard
};



function test(){
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
    ]
    //console.log(suck[0]);
    _.forIn(suck[0], function(value, key){
        //console.log(key);
        var shit = _.omit(value._key, '_type')
        console.log(shit);
    });
}

test();
/** [
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
] **/