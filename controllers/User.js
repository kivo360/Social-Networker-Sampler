var gremtool = require('./../general/gremfunc');
var tokenStuff = require('./../general/token');
var async = require('async');
var bcrypt = require('bcrypt');
var passport = require('./../config/passport');
var social = require('./../config/socialqueries');
var _ = require('lodash');
var timeline = require('./Timeline');
//var Timeline = new timeline;

exports.postLogin = function (req, res, next) {
    req.assert('phones', 'Not a phone number').len(7, 11).isInt();
    req.assert('password', 'Password must be at least 4 characters long').len(5);

    var errors = req.validationErrors();

    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            //Send the JSON token here. Make client save
            tokenStuff.create(user, function (toke) {
                return res.json(toke);
            });

        });
    })(req, res, next);

    //console.log("Logging In");

};




exports.postRegister = function (req, res) {
    req.assert('phone', 'Not a phone number').notEmpty();
    req.assert('password', 'Password must be at least 5 characters long').notEmpty().len(5).isAlphanumeric();
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.assert('fname', 'Incorrect first name (Either empty or not an alphabet)').notEmpty().isAlpha();
    req.assert('lname', 'Incorrect last name (Either empty or not an alphabet)').notEmpty().isAlpha();

    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }


    async.waterfall([
                // Check for existence first
                function (callback) {
                    gremtool.exist({phone: req.param('phone'), type: "person"}, "", function (err, result) {
                        callback(null, result);
                    });
                },
                function (exist, callback) {
                    // If this person doesn't exist create an object of them
                    //console.log("Does the user exist? ", exist);
                    if(!exist){
                        UserObjCreator(req.param('phone'), req.param('password'), req.param('fname'), req.param('lname'), function (result) {
                            callback(null, result)
                        });
                    }else{
                        callback(null, false);
                    }
                },
                function (user, callback) {
                    //console.log(user);
                    if(!user){
                        callback(null, {message: "The User With The Number " + req.param('phone') + " Already Exist"}, true)
                    }
                    gremtool.create(user, function (err, use) {
                        callback(null, use, false);
                    });
                }
    ], function (err, result, exist) {
        if(Boolean(exist)){
            return res.json(result);
        }else{
            var payload = {userId: result.results[0]._id, lastname: result.results[0].last, firstname: result.results[0].first};

            tokenStuff.create(payload, function (toke) {
                return res.json(toke);
            });
        }
    });
    
};




exports.postAddComment = function (req, res) {
    // Need to get the personId from the session.
    // EDIT: GET personId from token. Make sure to 
    req.assert('itemId', 'Your item Id Is Not a number').isInt();
    req.assert('comment', 'Comment is not a String').notEmpty();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    //Assert for token value in body
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    var itemId = req.param('itemId');
    var commentText = req.param('comment');
    var token = req.param('token');

    async.auto({
            check_token: function (callback) {
                tokenStuff.validate(token, function (valtoken) {
                    if(!valtoken){
                        return res.json({error: "Your token is not valid try to login again."});
                    }
                    callback(null, valtoken);
                });

            },
            check_item: function (callback) {
                gremtool.type(itemId, 'person', function (err, resu) {
                    console.log(resu);
                    if( resu.result == "nill"){
                        return res.json({message: "The item you are trying to comment on doesn\'t exist."})
                    }
                    callback(null, resu);
                });
            },
            create_comment: ['check_item', function (callback, resu) {
                var comment = {
                    type: "comment",
                    ctext: commentText,
                    commentTime: new Date().valueOf()
                };

                // If false
                if(!resu.check_item.tval){
                    gremtool.create(comment, function (err, resu2) {
                        if(err){
                            return res.json({message: "We couldn\'t add the comment"})
                        }
                        callback(null, resu2.results[0]);
                    });
                }else{
                    return res.json({message: "Failure, comment couldn\'t be added"})
                }

            }],
            item_to_comment: ['create_comment', function (callback, resu) {
                // take the id from the created comment and link it to the item
                console.log(resu.create_comment._id);
                console.log(itemId);
                gremtool.rel(itemId, resu.create_comment._id, "commentof", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Failure, comment couldn\'t be added"})
                    }
                    callback(null, "success")
                });
            }],
            person_to_comment: ['get_token', 'create_comment', function (callback, resu) {
                // take the id from the created comment and link it to the user Id
                console.log(resu.check_token.userId);
                gremtool.rel(resu.check_token.userId, resu.create_comment._id, "commented", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Failure, comment couldn\'t be added"})
                    }else{
                        callback(null, "success");
                    }
                });
            }]
    }, function (err, result) {
        return res.json({message: "The Comment Was Created", obj: result.create_comment});
    });
};

exports.postFriendUser = function (req, res) {

    req.assert('personId2', 'Not a number').isInt();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var newFriend = req.param('personId2');
    var token =  req.params('token');

    async.auto({
                //check_token: function (callback) {
                check_token: function (callback) {
                    tokenStuff.validate(token, function (valtoken) {
                        if(!valtoken){
                            return res.json({error: "Your token is not valid try to login again."});
                        }
                        callback(null, valtoken);
                    });

                },
                check_person: function (callback) {
                    gremtool.type(newFriend, 'person', function (err, resu) {
                        console.log(resu);
                        if( resu == "nill"){
                            return res.json({message: "The person you\'re trying to friend doesn\'t exist."})
                        }else{
                            callback(null, resu);
                        }

                    });
                },
                add_friend: ['check_person', function (callback, resu) {

                    // If false
                    if(resu.check_person.tval){
                        gremtool.rel(req.user.userId, newFriend, "friend", function (err, result) {
                            if(err){
                                console.log(err);
                                return res.json({message: "Sorry, you can\'t be friends. "});
                            }
                            callback(null, "success");
                        });
                    }else{
                        return res.json({message: "Sorry, you can\'t be friends with something that\'s not a person."})
                    }

                }]
    }, function (err, result) {
        if(err){
            return res.json({message: "Sorry, you can\'t be friends."})
        }
        return res.json({message: "You are now friends.", friendInfo: result.check_person.result});
    });
};



exports.postAddLike = function (req, res) {
    req.assert('itemId', 'Your item Id Is Not a number').isInt();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }



    var itemId = req.param('itemId');
    var token =  req.params('token');

    async.auto({
                check_token: function (callback) {
                    tokenStuff.validate(token, function (valtoken) {
                        if(!valtoken){
                            return res.json({error: "Your token is not valid try to login again."});
                        }
                        callback(null, valtoken);
                    });

                },
                check_person: function (callback) {
                    gremtool.type(itemId, 'person', function (err, resu) {
                        if( resu == "nill"){
                            return res.json({message: "The person you\'re trying to friend doesn\'t exist."})
                        }
                        callback(null, resu);
                    });
                },
                add_like: ['check_person', function (callback, resu) {


                    // If false
                    if(!resu.check_person.tval){
                        gremtool.rel(req.user.userId, itemId, "like", function (err, result) {
                            if(err){
                                console.log(err);
                                return res.json({message: "Sorry, you can\'t like that."});
                            }
                            callback(null, "success");
                        });
                    }else{
                        return res.json({message: "Sorry, you can\'t like a person."})
                    }

                }]
    }, function (err, result) {
        if(err){
            return res.json({message: "You can\'t like that"})
        }
        return res.json({message: "You have liked that item."});
    });
};


/*
 * Gets the personId in order to find the friends
 * Of a given user
 */
exports.postGetFriends = function (req, res) {
    req.assert('personId', 'Not a number').isInt();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    //else if(req.session.passport.user === undefined){
    //    return res.redirect('/login');
    //}

    var p_id = req.param('personId');
    var token =  req.params('token');

    async.auto({
                check_token: function (callback) {
                    tokenStuff.validate(token, function (valtoken) {
                        if(!valtoken){
                            return res.json({error: "Your token is not valid try to login again."});
                        }
                        callback(null, valtoken);
                    });

                },
                // Validate to see if the vertex is a person
                check_person: function (callback) {
                    gremtool.type(p_id, "person", function (err, result) {
                        if(err){
                            return res.json({message: "Something went wrong", error: err});
                        }
                        else{
                            callback(null, result)
                        }
                    });
                },
                get_friends: ['check_person', function (callback, resu) {
                    //console.log(resu.check_person.tval);
                    if(resu.check_person.tval){
                            gremtool.run(social.User.get_friends(p_id), function (err, friends) {
                                return res.json({friendList: friends.results});
                            });
                        }else{
                            return res.json({message: "Error: Not A User"})
                        }

                }]
    });

    //res.json({message: "The Input Works!!!"});
};

/*
 * Gets the itemsId in order to find the comments
 * On the given item
 */
exports.postGetComments = function (req, res) {
    req.assert('itemId', 'Not a number').isInt().notEmpty();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var item = req.param('itemId');
    var token =  req.params('token');

    async.auto({
                checkToken: function (callback) {
                    tokenStuff.validate(token, function (valtoken) {
                        if(!valtoken){
                            return res.json({error: "Your token is not valid try to login again."});
                        }
                        callback(null, valtoken);
                    });
                },
                // Validate to see if the vertex is a person (commentOf)
                check_person: function (callback) {
                    gremtool.type(item, "person", function (err, result) {
                        if(err){
                            return res.json({message: "Something went wrong", error: err});
                        }
                        else{
                            callback(null, result)
                        }
                    });
                },
                get_comments: ['check_person', function (callback, resu) {
                        if(!resu.check_person.tval){
                            gremtool.run(social.get_comments(item), function (err, comments) {
                                return res.json({friendList: comments.results});
                            });
                        }else{
                            return res.json({message: "Error: Not A User"})
                        }
                }]
    });
};

/*
 * Gets the itemsId in order to find the comments
 * On the given item
 */
exports.postGetLikers = function (req, res) {
    req.assert('itemId', 'Not a number').isInt();
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }


    var item = req.params('itemId');
    var token =  req.params('token');

    async.auto({
                checkToken: function (callback) {
                    tokenStuff.validate(token, function (valtoken) {
                        if(!valtoken){
                            return res.json({error: "Your token is not valid try to login again."});
                        }
                        callback(null, valtoken);
                    });
                },
                // Validate to see if the vertex is a person
                check_person: function (callback) {
                    gremtool.type(item, "person", function (err, result) {
                        if(err){
                            return res.json({message: "Something went wrong", error: err});
                        }
                        else{
                            callback(null, result)
                        }
                    });
                },
                get_likers: ['check_person', function (callback, resu) {
                    if(!resu.check_person.tval){
                        gremtool.run(social.get_likers(item), function (err, likers) {
                            return res.json({likes: likers.results});
                        });
                    }else{
                        return res.json({message: "Error: Not A User"})
                    }
                }]
    });
};

exports.getTimeline = function (req, res) {
    req.assert('token', 'Your Token Should Not Be Empty').notEmpty();
    req.assert('laccesstime', 'Your last access time in milliseconds').isInt().notEmpty();

    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var accesstime = req.param('laccesstime');
    var token =  req.param('token');
    //return res.json({token: token, access: accesstime});
    async.auto({
        checkToken: function (callback) {
            tokenStuff.validate(token, function (valtoken) {
                if(!valtoken){
                    return res.json({error: "Your token is not valid try to login again."});
                } callback(null, valtoken);
            });
        },
        getTimeline: ['checkToken', function(callback, resu){
            console.log(resu.checkToken.userId);
            timeline.createTimeline(accesstime, resu.checkToken.userId, function (ressy) {
                //console.dir(ressy);
                //console.log(ressy)
                if(!Boolean(ressy[0])){
                    return res.json({message: "You have nothing new in your timeline."})
                }
                else{
                    return res.json({timeline: ressy})
                }
            });
        }]
    });
};

exports.getContributers = function (req, res) {
    // Send in post id
    // check for postId
        // if false
            // return Sorry, Not a post
    // run get contributer query
        // if err
            // Sorry, there was an error on our end, we'll fix it
        // else
            // respond, results
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

