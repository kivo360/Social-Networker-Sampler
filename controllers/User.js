var gremtool = require('./../general/gremfunc');
var async = require('async');
var bcrypt = require('bcrypt');
var passport = require('./../config/passport');
var social = require('./../config/socialqueries');

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
    req.assert('phone', 'Not a phone number').notEmpty();
    req.assert('password', 'Password must be at least 5 characters long').notEmpty().len(5).isAlphanumeric();
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.assert('fname', 'Incorrect first name (Either empty or not an alphabet)').notEmpty().isAlpha();
    req.assert('lname', 'Incorrect last name (Either empty or not an alphabet)').notEmpty().isAlpha();
    //req.assert('uname', 'Cannot Use Special Characters').isAlphanumeric();
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
            console.log("Does the user exist? ", exist);
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
                console.log(use)
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
    } else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }
    var itemId = req.param('itemId');
    var commentText = req.param('comment');

    // Comment Information
        // Check for itemId, look at the session for userId
        // connect the item from the itemId to the the person
        // Connect the itemId to the person (commented)
        // The comment will have the date (timestamp), username, and the entire comment


    async.auto({
            check_item: function (callback) {
                gremtool.type(itemId, 'person', function (err, resu) {
                    console.log(resu);
                    if( resu == "nill"){
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
                if(!resu.check_item){
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
            person_to_comment: ['create_comment', function (callback, resu) {
                // take the id from the created comment and link it to the user Id
                console.log(req.user.userId);
                gremtool.rel(req.user.userId, resu.create_comment._id, "commented", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Failure, comment couldn\'t be added"})
                    }
                    callback(null, "success");
                });
            }]
    }, function (err, result) {
        return res.json({message: "The Comment Was Created", obj: result.create_comment});
    });
};

exports.postFriendUser = function (req, res) {

    req.assert('personId2', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }

    var newFriend = req.param('personId2');

    // Check for personId2, look at the session for userId
    // Connect the two friends together if the validation is passed
    // The link will have a timestamp, and a weight of 0.5

    async.auto({
        check_person: function (callback) {
            gremtool.type(newFriend, 'person', function (err, resu) {
                console.log(resu);
                if( resu == "nill"){
                    return res.json({message: "The person you\'re trying to friend doesn\'t exist."})
                }
                callback(null, resu);
            });
        },
        add_friend: ['check_person', function (callback, resu) {


            // If false
            if(resu.check_person){
                gremtool.rel(req.user.userId, newFriend, "friend", function (err, result) {
                    if(err){
                        console.log(err);
                        return res.json({message: "Sorry, you can\'t be friends."});
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
        return res.json({message: "You are now friends."});
    });
};



exports.postAddLike = function (req, res) {
    req.assert('itemId', 'Your item Id Is Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }
    else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }


    var itemId = req.param('itemId');


    // async.waterfall
        // Check for itemId, look at the session for userId
        // Validate to see if the itemId is not a user. Users can only be friend-ed.
        // Connect the person to the item w/ itemId
        // The comment will have the date (timestamp "for queries"), username

    async.auto({
                check_person: function (callback) {
                    gremtool.type(itemId, 'person', function (err, resu) {
                        console.log(resu);
                        if( resu == "nill"){
                            return res.json({message: "The person you\'re trying to friend doesn\'t exist."})
                        }
                        callback(null, resu);
                    });
                },
                add_like: ['check_person', function (callback, resu) {


                    // If false
                    if(!resu.check_person){
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
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }

    var p_id = req.param('personId');

    async.auto({
                // Validate to see if the vertex is a person
                check_person: function (callback) {
                    gremtool.checkType(p_id, "person", function (err, result) {
                        if(err){
                            return res.json({message: "Something went wrong", error: err});
                        }
                        else{
                            callback(null, result)
                        }
                    });
                },
                get_friends: ['check_person', function (callback, resu) {
                        if(resu.check_person){
                            gremtool.run(social.get_friends(p_id), function (err, friends) {
                                return res.json({friendList: friends.results[0]});
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
    req.assert('itemId', 'Not a number').isInt();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }


    var item = req.param('itemId');

    async.auto({
                // Validate to see if the vertex is a person
                check_person: function (callback) {
                    gremtool.checkType(p_id, "person", function (err, result) {
                        if(err){
                            return res.json({message: "Something went wrong", error: err});
                        }
                        else{
                            callback(null, result)
                        }
                    });
                },
                get_comments: ['check_person', function (callback, resu) {
                        if(!resu.check_person){
                            gremtool.run(social.get_comments(item), function (err, comments) {
                                return res.json({friendList: comments.results});
                            });
                        }else{
                            return res.json({message: "Error: Not A User"})
                        }
                    }
                ]
    });
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
    } else if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }


    var item = req.params('itemId');


    async.auto({
        // Validate to see if the vertex is a person
        check_person: function (callback) {
            gremtool.checkType(item, "person", function (err, result) {
                if(err){
                    return res.json({message: "Something went wrong", error: err});
                }
                else{
                    callback(null, result)
                }
            });
        },
        get_likers: ['check_person', function (callback, resu) {
            if(!resu.check_person){
                gremtool.run(social.get_likers(item), function (err, likers) {
                    return res.json({likes: likers.results});
                });
            }else{
                return res.json({message: "Error: Not A User"})
            }
        }
        ]
    });


    //res.json({message: "The Input Works!!!"});
};


exports.newVideo = function (req, res) {
    // Check for userId
    req.assert('videoTags', 'Not an array').isArray();
    var errors = req.validationErrors();
    if(errors){
        return res.json({message: "One of your inputs is not correct.", err: errors});
    }

    var uploadedFile = req.files.file;
    // Check for video file
    if(uploadedFile === undefined){
        res.json({message: "You didn\'t add a file"});
    }if(req.session.passport.user === undefined){
        return res.redirect('/login');
    }


    // Check For Meta Tags
    // Check post info
        // Post Comment (300)
        // Get date
        // new Date().





    // TODO: Offload this into separate file after for refactor
    //async.auto({
    //        upload_video_file: function (callback) {
    //            // Uploading the file
    //            console.log("upload the video file");
    //            callback(null, 'video_file');
    //        },
    //        create_post: function (callback) {
    //            console.log("Create Post About Stuff");
    //            callback(null, 'Add Post');
    //        },
    //        check_for_user: function (callback) {
    //            callback(null, 'user does exist || doesn\'t exist');
    //        },
    //        create_video_group: function(callback){
    //            callback(null, 'video_group')
    //        },
    //        add_video_node: ['create_video_group', 'upload_video_file', function (callback, results) {
    //            console.log("Creating the video");
    //            callback(null, 'video_node');
    //        }],
    //        video_to_user: ['add_video_node', function (callback, results) {
    //            // Link the user to the video 'created'
    //            callback(null, 'link_id');
    //        }],
    //        video_to_video_group: ['add_video_node', function (callback, results) {
    //            // Connect the video_group to the video'
    //            // TODO: date timestamp (milliseconds) to sequence each video.
    //            console.log("Linking video to video_group");
    //            callback(null, 'isDone');
    //        }],
    //        post_to_user: ['create_post', 'check_for_user', function (callback, results) {
    //            // Connect the user and post together
    //            callback(null, 'isDone');
    //        }],
    //        video_group_to_post: ['create_post', 'create_video_group', function (callback, results) {
    //            callback(null, 'isDone');
    //        }]
    //
    //    }, function (err, results) {
    //        console.log("Err: ", err);
    //        console.log('results = ', results);
    //    }
    //);
};

exports.addVideo = function (req, res) {
    // Check For PostId
    // Check For VideoFile
    // Check For Meta Tags

    async.auto({
        upload_video_file: function (callback) {
            // Uploading the file
            console.log("upload the video file");
            callback(null, 'video_file');
        },
        create_post: function (callback) {
            console.log("Create Post About Stuff");
            callback(null, 'Add Post');
        },
        check_for_user: function (callback) {
            callback(null, 'user does exist || doesn\'t exist');
        },
        create_video_group: function(callback){
            callback(null, 'video_group')
        },
        add_video_node: ['create_video_group', 'upload_video_file', function (callback, results) {
            console.log("Creating the video");
            callback(null, 'video_node');
        }],
        video_to_user: ['add_video_node', function (callback, results) {
            // Link the user to the video 'created'
            callback(null, 'link_id');
        }],
        video_to_video_group: ['add_video_node', function (callback, results) {
            // Connect the video_group to the video'
            // TODO: date timestamp (milliseconds) to sequence each video.
            console.log("Linking video to video_group");
            callback(null, 'isDone');
        }],
        post_to_user: ['create_post', 'check_for_user', function (callback, results) {
            // Connect the user and post together
            callback(null, 'isDone');
        }],
        video_group_to_post: ['create_post', 'create_video_group', function (callback, results) {
            callback(null, 'isDone');
        }]

    }, function (err, results) {
        console.log("Err: ", err);
        console.log('results = ', results);
    });
    // Upload Video
        // if:yes Create Video Vertex
            // if:yes Link Video vertex and video_group_by_post
                // if:yes return a Success Message
            // if:no return error message(json)
        // if:no return error message(json)

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

