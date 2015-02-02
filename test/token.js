/**
 * Created by kevin on 1/31/15.
 */

var jwt = require('jwt-simple');
var payload = { username: 'bar' };
var secret = 'xxx';

// encode
var token = jwt.encode(payload, secret);
//console.log(token);
// decode

var decoded = jwt.decode(token, secret);

var sendToken = {token: token};
console.log(sendToken);
console.log(decoded);