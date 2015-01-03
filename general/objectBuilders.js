/**
 * Created by kevin on 12/31/14.
 */
var bcrypt = require('bcrypt');
var UserObjCreator = function (phone, pword, fname, lname, cb) {
    bcrypt.hash(pword, 10, function(err, hash) {
        if(err) throw err;
        var user = {
            type: "person",
            phone: phone,
            pass: hash,
            first: fname,
            last: lname,
            facebook: false
        };
        return cb(user);
    });

};



var User = function(){
    this.phoneNum = 0;
    this.password = "";
    this.firstName = "";
    this.lastName = "";
    this.faceBook = false;

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


    this.buildJSON = function () {
        //Validate User First
        return {
            phone: phoneNum,
            pass: password,
            first: firstName,
            last: lastName,
            facebook: faceBook,
            type: "person"
        };
    }
};