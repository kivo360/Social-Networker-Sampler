/**
 * Created by kevin on 2/1/15.
 */
var jwt = require('jwt-simple');
var secret = require('./../config/secret');
var exptime = 3600 * 1000 * 24 * 60; // 60 days in milliseconds



function createToken (userData, cb) {
    var currentTime = new Date().valueOf();
    var tPayload = { time: currentTime, userId: userData.userId, first: userData.firstname, last: userData.lastname, device: "NIL"};
    var token = jwt.encode(tPayload, secret.tokenSecret);
    //Add device data
    cb({token: token});
}

var validateToken = function (tokenJson, cb) {
    // 2 month expiration time

    var decoded;
    try{

        decoded = jwt.decode(tokenJson, secret.tokenSecret);
    }catch(err){
        // Send err to log server
        console.log(err);
        return cb(false);
    }


    // Check the time. Check for 60 days of session time
    var signedTime = decoded.time;

    if(signedTime < signedTime + exptime){
        cb(decoded);
    }else{
        // if the time isn't right, return a create a new token. Serve the bitches
        cb(false);
    }
    // Check the device information
    // if the device isn't right, return a false
};



module.exports = {
    create: createToken,
    validate: validateToken
};