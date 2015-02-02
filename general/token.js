/**
 * Created by kevin on 2/1/15.
 */
var jwt = require('jwt-simple');
var secret = require('./../config/secret');
var exptime = 3600 * 1000 * 24 * 60; // 60 days is milliseconds
var createToken = function (userData) {
    var currentTime = new Date().valueOf();
    var tPayload = { time: currentTime, userId: userData.userId, first: userData.firstname, last: userData.lastname, device: "NIL"};
    var token = jwt.encode(tPayload, secret.tokenSecret);
    //Add device data
    return {token: token};
};

var validateToken = function (tokenJson) {
    // 2 month expiration time
    var decoded = jwt.decode(tokenJson, secret.tokenSecret);

    // Check the time. Check for 60 days of session time
    //var bitches = decoded.time + exptime + 9000;

    if(signedTime < signedTime + exptime){
        return decoded;
    }
    // Check the device information
    // if correct return the decoded value with the user id and the first and last name
    return {shit: "dick"};
};


var central = function () {

};
module.exports = {
    create: createToken,
    validate: validateToken
};