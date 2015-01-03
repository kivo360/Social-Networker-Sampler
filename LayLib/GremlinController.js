/**
 * Created by kevin on 12/8/14.
 * There has to be a type within each object to query it effectively.
 * TODO: Should go into config secret file
 */
var grex = require('grex');
var Validation = require('./Validation.js');

var settings = {
    'host': 'localhost',
    'port': 8182,
    'graph': 'graph'
};

/**
 * Setup grex here
 *
 */
var client = grex.createClient(settings);

var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;
var _ = grex._;

/***
 * Query objects must look like the following:
 * {searchKey: searchValue, type: typeValue}
 */

var VertexMethods = function () {

};

VertexMethods.prototype.changeObject = function (originalObject, callback) {
    if(Boolean(originalObject)){
        callback(new Error("Object Does Not Exist"), {});
    }else{
        callback("", originalObject)
    }

};
/**
 * Controls validation and the vertex stack.
 * Adding and removing values will use this
 * Manipulating values will require the **VertexMethods** class
 * @constructor
 **/

var GremlinController = function(){
    this.allowDuplicates = true;
    this.addVertex = undefined;
    this.resultArr = []; // To see the last result on the list

    //Great to see the last action on the list.
    //Can use as alternative to result arr, if action not result dependent.
    this.actionList = [];

    this.lastResult = function () {
        if(this.resultArr.length === 0){
            return 0;
        }
        else{
            return this.resultArr[this.resultArr.length-1];
        }
    };

    this.lastAction= function () {
        if(this.resultArr.length === 0){
            return 0;
        }
        else{
            return this.actionList[this.actionList.length-1];
        }
    };

    this.getLast = function () {
        if(this.resultArr.length === 0){
            return 0;
        }
        else{
            return this.resultArr[this.resultArr.length-1];
        }
    };
    
    this.lastOf = function (resultType) {
        for(var i = this.resultArr.length; i<0; i--){
            if(this.resultArr[i].type == resultType){
                return this.resultArr[i].type;
            }
        }
    };
};

//Stands for the Vertex Query
GremlinController.prototype.vQuery = function(valueType, value, type){
    var self = this;
    var query = gremlin();
    query.var(g.V(valueType, value).has('type', T.eq, type));
    client.execute(query, function(err, response) {
        //console.log(response);
        if(!(Boolean(response).valueOf())){
            //Means the database is giving shit out. AKA null/undefined/or the query was not a success.
            //fn(null, {result: "N/A", isExist: false, type: "Vertex Query"});
            self.resultArr.push({result: [], isExist: false, type: "vertexQuery", success: false, note: "None"});
            self.actionList.push("vertexQuery");
            return self;

        }else if(response.results.length === 0){
            self.resultArr.push({result: [], isExist: false, type: "vertexQuery",success: true, note: "None"});
            self.actionList.push("vertexQuery");
            return self;
        }
        else{
            self.resultArr.push({result: response.results, isExist: false, type: "vertexQuery", success: true, note: "None"});
            self.actionList.push("vertexQuery");
            return self;
        }
        return self;
    });
    return self;
};

GremlinController.prototype.noDuplicates = function () {
    this.allowDuplicates = false;
    console.log("Not allowing duplicates to happen.");
    return this;
};

GremlinController.prototype.addNode = function (vertexObj) {
    var self = this;
    //Safer version of 'this' keyword
    var query = gremlin();
    var valid = new Validation();
    //Check if the you allow duplicates
    if(!this.allowDuplicates){
        //
        if(!(valid.queryValidation(vertexObj))){
            self.resultArr.push({result: [], isExist: false, type: "addVertex", success: false, note: "Your query is not valid"});
            return self;
        }
        var keySet = valid.lastKeySet();
        var keyZero = keySet[0]; //The first key of the object
        var typeKey = keySet[keySet.lastIndexOf("type")];

        var lastResult = self.vQuery(keySet[0], vertexObj[keyZero], vertexObj[typeKey]).lastResult();

        if(valid.getBool(lastResult.result.length) && (lastResult.type == "vertexQuery")){
            // Allow vertex to be added now
            query.var(g.addVertex(vertexObj));
            client.execute(query, function(err, response) {
                if(Boolean(response).valueOf() === false){
                    console.log("You're getting an undefined");
                    //Means the database is giving shit out. AKA null/undefined/or something else
                    self.resultArr.push({result: [], isExist: true, type: "addVertex", success: false, note: "The query was not executed correctly"});
                    return self;
                }else{
                    self.resultArr.push({result: response.results, isExist: true, type: "addVertex", success: true, note: "The vertex provided was added"});
                    return self;
                }
            });

        }

    }

    else if(valid.queryValidation(vertexObj)){
        query(g.addVertex(vertexObj));

        client.execute(query, function(err, response) {
            if(Boolean(response).valueOf() === false){
                //Means the database is giving shit out. AKA null/undefined/or something else
                console.log("You're getting an undefined");
                self.resultArr.push({result: [], isExist: true, type: "addVertex", success: false, note: "The query was not executed correctly"});
                return self;
            }else{
                self.resultArr.push({result: response.results, isExist: true, type: "addVertex", success: true, note: "The vertex provided was added"});
                return self;
            }
        });
    }else{
        console.log("Your query is not valid");
        return self;
    }

};



GremlinController.prototype.removeVertex = function (valueType, value, type) {
    //Check if the you allow duplicates
    var self = this;
    var query = gremlin();
    query.var(g.V(valueType, value).has('type', T,eq, type).remove());

    client.execute(query, function(err, response) {
        if(Boolean(response).valueOf() === false){
            //Means the database is giving shit out. AKA null/undefined/or something else

            self.resultArr.push({result: [], isExist: true, type: "removeVertex", success: false, note: "The query was not executed correctly"});
            return this;
        }else{
            self.resultArr.push({result: response.results, isExist: false, type: "removeVertex", success: true, note: "The vertex was removed"});
            return this;
        }
    });

};

/***
 * Will work on updating later. Complicated logic
 * @param queryObject
 */
GremlinController.prototype.updateVertex = function (queryObject) {
    //Check if the you allow duplicates
    var self = this;
    var valid = new Validation();
    if(valid.queryValidation(queryObject)){
        var qKeys = Object.keys(queryObject);

        this.vQuery(qKeys[0], queryObject[qKeys[0]], queryObject[qKeys[1]])
            .removeVertex(qKeys[0], queryObject[qKeys[0]], queryObject[qKeys[1]]);
    }
    //return this;
};


/**
 * Will return a true if the previous action or result type is equal.
 * @param actionType
 * @returns {boolean}
 */
GremlinController.prototype.equalPrevType = function(actionType){

    if(this.getLast() !== actionType && this.getLast().type !== actionType){
        return false
    }
    return true;
};

GremlinController.prototype.lastCallback = function (callback) {
    var gl = this.getLast();
    if(gl === 0){
        callback(new Error("The last command was not correct"), gl);
    }
    callback(false, gl);
};

GremlinController.prototype.testShit = function () {
    console.log("Fuck My Life");
};

module.exports = new GremlinController();