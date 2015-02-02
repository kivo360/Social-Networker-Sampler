/**
 * Created by kevin on 12/27/14.
 */
var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var gremfunc = require('./../general/gremfunc');
var User = require('./../model/UserModel');
var secrets = require('./secret');



//passport.use(new LocalStrategy(
//    {usernameField: 'phones'},
//    function (phones, password, done) {
//        console.log(phones);
//        console.log(password);
//        gremfunc.find({type: "person",phone: phones}, function (err, user) {
//            new User().validateUser(password, user.results[0], function (err, isMatch) {
//                if(isMatch){
//                    //Encode the secret with user id
//                    return done(null, {uid: user.results[0]});
//                }else{
//                    return done(null, false);
//                }
//            });
//        });
//
//    }
//));


passport.use(new LocalStrategy(
    {usernameField: 'phones'},
    function (phones, password, done) {
        console.log(phones);
        console.log(password);
        gremfunc.find({type: "person",phone: phones}, function (err, user) {
            new User().validateUser(password, user.results[0], function (err, isMatch) {
                if(isMatch){
                    return done(null, {userId: user.results[0]._id, firstname: user.results[0].first, lastname: user.results[0].last});
                }else{
                    return done(null, false);
                }
            });
        });

    }
));

passport.serializeUser(function (user, done) {
    done(null, user.userId);
});

passport.deserializeUser(function (userId, done) {
    done(null, {userId: userId});
});

module.exports = passport;