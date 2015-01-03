var gremtool = require('./../general/gremfunc');
var bcrypt = require('bcrypt');
var UserModel = function () {
    var id = 1;
    //Extract the object into new object
    this.masterObj = {};

    this.createUser = function (userObj) {
        //Validate
        
    };

    this.getComments = function (callback) {
        var comments = [];
        //Search through all comments made  by the user
        callback(comments);
    }
    
    this.validateUserFields = function (userObj) {
        var numType = typeof userObj.phoneNum;
        var passType = typeof userObj.password;
        var facebook = typeof userObj.facebook;

        if(numType == "string" && passType == "string" && facebook == "boolean"){
            return true;
        }
        else{
            return false;
        }
    };
    this.validateUser = function (pass, usrObj, cb) {
        if(Boolean(usrObj) === false) return;

        bcrypt.compare(pass, usrObj.pass, function(err, result) {
            console.log(result);
            return cb(err, result);
        });
    };

};



module.exports = UserModel;