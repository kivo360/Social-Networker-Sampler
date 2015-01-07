/**
 * Created by kevin on 12/11/14.
 * TODO: REFACTOR!!!
 **/



var grex = require('grex');
var settings = require('./../config/secret');

/**
 * Setup grex here
 *
 **/


var client = grex.createClient(settings.titan);

var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;
var _ = grex._;

/**
 * The Other Libraries
 **/
var async = require('async');

/**
 * Checks to see if the object has some truth.
 * @param value
 * @returns {Object}
 */

function isTruthy(value){
    return Boolean(value).valueOf()
}

function isObject(value){
    return (typeof value == 'object')
}

/**
 * Validates the Query Object to see if it can be searched effectively
 * @param queryObject
 * @returns {boolean}
 */
var queryValidation = function (queryObject) {
    var oKey = Object.keys(queryObject);
    if(oKey.lastIndexOf("type") < 0  || oKey.length > 2){
        return false;
    }
    return true;
};

/**
 * Finds a vertex using the supplied object.
 * Must have a type supplied to narrow the query
 * @param queryObj
 * @param cb -- The callback function
 **/
var vertexQuery = function (queryObj, cb) {
    aS = typeof aS !== 'undefined' ? aS : false;
    if((!isObject(queryObj) && !isTruthy(queryObj)) || !queryValidation(queryObj)){
        return cb(new Error("The query object is not valid"), queryObj);
    }else{
        var query = gremlin();
        var qKey = Object.keys(queryObj);
        var zKey = qKey[0]; //Key at index of zero

        query(g.V(zKey, queryObj[zKey]).has('type', T.eq, queryObj["type"]));
        client.execute(query, function(err, response) {
            return cb(err, response);
        });
    }
};


var RemoveStuff = function (queryObj, cb) {
    aS = typeof aS !== 'undefined' ? aS : false;
    if((!isObject(queryObj) && !isTruthy(queryObj)) || !queryValidation(queryObj)){
        return cb(new Error("The query object is not valid"), queryObj);
    }else{
        var query = gremlin();
        var qKey = Object.keys(queryObj);
        var zKey = qKey[0]; //Key at index of zero

        query(g.V(zKey, queryObj[zKey]).has('type', T.eq, queryObj["type"]).remove());
        client.execute(query, function(err, response) {
            return cb(err, response);
        });
    }
};





var runQuery = function (query, cb) {
    client.execute(query, function(err, response) {
        //console.log(response);
        return cb(err,response);
    });
};

var findId = function (id, cb) {
    var query = gremlin(g.v(id));
    runQuery(query, function (err, res) {
        cb(err, res);
    });
};

var checkType = function (id, type, cb) {
    var query = gremlin(g.v(id));
    runQuery(query, function (err, res) {
        var person = {};
        console.log(res);
        if(err){
            return cb(err, "nill");
        } else if(!Boolean(res.results)){
            return cb(new Error("Nothing Under Id Exist"), "nill");
        }else{
            person = res.results[0];
        }

        // Check for a the given type Now
        if(person.type !== type){
            return cb(err, false);
        }else{
            return cb(err, true);
        }
    });
};


/***
 * Requires you to have a a queryObj and the query itself.
 * Add a pre-query, if you need to check for more complicated results.
 * @param queryObj
 * @param query
 * @param isQuery
 */
var isExist = function (queryObj, query, cb) {
    query = typeof query !== 'undefined' ? query : "";
    async.waterfall([
        function(callback){
            if(Boolean(query)){
                if(query.name !== "GremlinAppender"){
                    throw new Error("The query is not the appropriate type [GremlinAppender]");
                    return;
                }
                runQuery(query, function (err, resu) {
                    console.log(resu);
                    callback(null, resu.results);
                });
            }
            else{
                vertexQuery(queryObj, function (err, resu) {
                    if(!isTruthy(resu.results)){
                        console.log(resu);
                        callback(null, "");
                    }
                    callback(null, resu.results);
                });
            }

        },
        function (resp, callback) {
            // Callback a boolean value
            console.log(resp)
            var boolValue = Boolean(resp[0]); //Check if the array is empty

            callback(null, boolValue);
        }
    ], function (err, result) {
        return cb(err, result);
    });
};


/**
 * Stands for easy relation. It finds two verticies
 * @param value1 -- Query Value one. Can be used to directly query the object, or
 * @param value2 -- Query Value two
 * @param relType -- The name of the relationship
 * @param cb -- sends the data to the next instance
 */
var easyRel = function (value1, value2, relType, cb) {
    var query = gremlin();
    var vertex1 = query.var(g.v(value1));
    var vertex2 = query.var(g.v(value2));
    query(g.addEdge(vertex1, vertex2, relType, { since: new Date().valueOf() }));
    client.execute(query, function(err, response) {
        cb(err, response);
    });

};


//easyRel(5121024, 5120768, 'fingered', function (err, resultie) {
//   console.log(resultie);
//});

function createUser(){
    var query = gremlin();
    var userObject = {fname:"Kevin", lname: "Hill", uname: "kivo360", password: "haswqwkw12h2aklgsulabsqg", type:"person"};
    query(g.addVertex(userObject));
    runQuery(query, function (err, result) {
       console.log(result);
    });
}

//function createBitches2(){
//    var query = gremlin();
//
//    var checkedObject = {you:"whore", type:"human"};
//    query(g.addVertex(checkedObject));
//    ifNotExist(checkedObject, query, false, "");
//}

var Create = function (createdObj, cb) {
    var query = gremlin();
    if((!isObject(createdObj) && !isTruthy(createdObj))){
        return cb(new Error("The query object is not valid"), "");
    }else{
        query(g.addVertex(createdObj));
        runQuery(query, function (err, result) {
            //if(err) throw err;

            return cb(err, result);
        });
    }

};



/**
 * Kills all of the vertices in the graph
 */
var removeVertex = function(isCallback, cb){
    var query = gremlin();
    isCallback = typeof isCallback !== 'undefined' ? isCallback : false;
    query(g.V().remove());
    if(!isCallback){
        runQuery(query, function (err, result) {
            console.log(result);
            return;
        });
    }else{
        runQuery(query, function (err, result) {
            cb(null, result);
        });
    }

};

/**
 * Kills all of the edges in the graph
 */
var removeEdges = function(isCallback, cb){
    var query = gremlin();
    isCallback = typeof isCallback !== 'undefined' ? isCallback : false;
    query(g.E().remove());
    if(!isCallback){
        runQuery(query, function (err, result) {
            console.log(result);
            return;
        });
    }else{
        runQuery(query, function (err, result) {
            cb(null, result);
        });
    }
};

/**
 * Removes everything from the current graph
 */
function removeGraph(){
    async.series([
        function (callback) {
            removeVertex(true, callback);
        },
        function(callback){
            removeEdges(true, callback);
        }
    ]);
}

var remove = Number.prototype.Remove

// Export all of the functions for use
module.exports = {
    objIsValid: queryValidation,
    find: vertexQuery,
    exist: isExist,
    rel: easyRel,
    remove: {
        single: RemoveStuff,
        vertex: removeVertex,
        edges: removeEdges,
        all: removeGraph
    },
    create: Create,
    run: runQuery,
    findById: findId,
    type: checkType
};