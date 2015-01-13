/**
 * This file exist to manage all of the general objects and response headers.
 * It will ensure there's some consistency with creating new objects and that all error responses are the same.
 * Will use builder method for functionality
 * Created by kevin on 12/31/14.
 */



var bcrypt = require('bcrypt');


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
 * Will use lodash to manipulate all objs added in.
 * done() will return a object array with all objects having basic information
 * @constructor
 */
var ObjStandard = function () {

};

/**
 * Runs through given process depending on type
 * @param singleObj
 * @param type
 * @returns {ObjStandard}
 */
ObjStandard.prototype.addSingleObj = function (obj, type) {
    // Type lookup. Send obj to function by type
    var lateral = {
        'coke': 'Coke',
        'pepsi': 'Pepsi',
        'lemonade': 'Lemonade',
        'default': 'Default item'
    };
    return (lateral[type] || lateral['default']);
};

ObjStandard.prototype.addAddObj = function (objArr, type) {
    var lateral = {
        'coke': 'Coke',
        'pepsi': 'Pepsi',
        'lemonade': 'Lemonade',
        'default': 'Default item'
    };
};

console.log(new ObjStandard().addSingleObj({}, 'lemonade'));


function testFunction(){
    new Response('success')
        .setMessage("This shit sucks")
        .setErrorCode("SUCK")
        .done(function (obj) {
            console.log(obj);
        });

}



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

new User().buildJSON(function (dick){
   console.log(dick);
});

testFunction();