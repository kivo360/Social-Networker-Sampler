var gremtool = require('./../general/gremfunc');
var async = require('async');
var bcrypt = require('bcrypt');
var passport = require('./../config/passport');


exports.postLogin = function (req, res, next) {
    req.assert('phones', 'Not a phone number').len(7, 11).isInt();
    req.assert('password', 'Password must be at least 4 characters long').len(5);
    //req.assert('passwordHash', 'Cannot be empty').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            //req.flash('errors', { msg: info.message });
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            //req.flash('success', { msg: 'Success! You are logged in.' });
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);

    //console.log("Logging In");

};

exports.postRegister = function (req, res) {
    req.assert('phone', 'Not a phone number').len(9, 11).isInt();
    req.assert('password', 'Password must be at least 5 characters long').len(5);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.assert('fname', 'Incorrect first name (Either empty or not an alphabit)').notEmpty().isAlpha();
    req.assert('lname', 'Incorrect last name (Either empty or not an alphabet)').notEmpty().isAlpha();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    async.waterfall([
        // Check for existence first
        function (callback) {
            gremtool.exist({type: "person", phone: req.param('phone')}, "", function (err, result) {
                callback(null, result);
            });
        },
        function (exist, callback) {
            // If this person doesn't exist create an object of them
            console.log(exist);
            if(!exist){
                UserObjCreator(req.param('phone'), req.param('password'), req.param('fname'), req.param('lname'), function (result) {
                    callback(null, result)
                });
            }else{
                callback(null, false);
            }
        },
        function (user, callback) {
            console.log(user);
            if(!user){
                callback(null, {message: "The User With The Number " + req.param('phone') + " Already Exist"})
            }
            //callback(null, user);
            gremtool.create(user, function (err, use) {
                callback(null, use);
            });
        }
    ], function (err, result) {
        res.json(result);
    });
    
};




exports.postAddComment = function (req, res) {
    // Need to get the personId from the session.
    req.assert('itemId', 'Your item Id Is Not a number').isInt();
    req.assert('comment', 'Comment is not a string').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    var itemId = req.param('itemId');
    var commentText = req.param('comment');

    if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }else{
        return res.json({u_id: req.user.userId, item: itemId, comment: commentText});
    }

    return res.json({message: "The Input Works!!!"});
};

exports.postFriendUser = function (req, res) {

    req.assert('personId2', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }
    else{
        return res.render('user', {user: req.user});
    }

    return res.json({message: "The Input Works!!!"});
};



exports.postAddLike = function (req, res) {
    req.assert('personId', 'Not a number').isInt();
    req.assert('itemId', 'Your item Id Is Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    res.json({message: "The Input Works!!!"});
};


/*
 * Gets the personId in order to find the friends
 * Of a given user
 */
exports.postGetFriends = function (req, res) {
    req.assert('personId', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    // Validate to see if the vertex is a person
    // Check to validate node
        // If it is send the list of users into the list
    res.json({message: "The Input Works!!!"});
};

/*
 * Gets the itemsId in order to find the comments
 * On the given item
 */
exports.postGetComments = function (req, res) {
    req.assert('itemId', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    //
    res.json({message: "The Input Works!!!"});
};

/*
 * Gets the itemsId in order to find the comments
 * On the given item
 */
exports.postGetLikers = function (req, res) {
    req.assert('itemId', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    req.params('itemId');
    //
    res.json({message: "The Input Works!!!"});
};


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