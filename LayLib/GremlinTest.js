/**
 * Created by kevin on 12/10/14.
 */
/**
 * Setup grex here
 *
 */

var o_o = require("./GremlinController");
//o_o.noDuplicates().addNode({name: "fuckme", type: "dick"}).lastCallback(function (err, resuly) {
//    console.log(resuly);
//
//});

console.log(o_o.vQuery("name", "fuckMe", "dick").lastResult());

//var async = require('async');
//
//var grex = require('grex');
//var valid = require('./Validation.js');
//var settings = {
//    'host': 'localhost',
//    'port': 8182,
//    'graph': 'graph'
//};
//var client = grex.createClient(settings);
//
//var gremlin = grex.gremlin;
//var g = grex.g;
//var T = grex.T;
//var _ = grex._;
//var query = gremlin();
////query(g.addVertex({uname: "herp", password: "derp", type: "user"}));
//query.var(g.V("uname", "herp").has('type', T.eq, "user"));
////query.var(g.V("type", "user").remove());
//client.execute(query, function(err, response) {
//    if(!(Boolean(response.results).valueOf()) ||response.success === false){
//        console.log("Not good: ");
//        console.log(response);
//    }
//    else if(response.results.length === 0){
//        console.log("Nothin exist");
//    }
//    else{
//        console.log(response);
//    }
//    console.log();
//});
//async.series([
//    function () {
//        O_O.addVertex
//        callback();
//    }
//], function (err, results) {
//
//})
