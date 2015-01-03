/**
 * Created by kevin on 12/24/14.
 */
var gremtool = require('./../general/gremfunc');

gremtool.remove.all();
//gremtool.remove.edges();
//gremtool.remove.vertex();

var createUser = function () {
    gremtool.vertexQuery({uname: "kivo360", type:"person"}, function (err, result) {
        if(err){
            console.log("There is an error");
            console.log();
        }
        else{
            console.log(result);
        }
    });
};



createUser();

//vertexQuery({fname:"Kevin", lname: "Hill", uname: "kivo360", password: "haswqwkw12h2aklgsulabsqg", type:"person"}, function (err, result) {
//    if(err){
//        console.log("There is an error");
//
//    }
//    else{
//        console.log(result);
//    }
//});
//var query2 = gremlin();
//var checkedObject = {uname: "kivo360", type:"person"};
//isExist(checkedObject, "", false, function (err, resu) {
//    console.log(resu);
//});