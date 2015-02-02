/**
 * Created by kevin on 12/24/14.
 */
var gremtool = require('./../general/gremfunc');
var grex = require('grex');
var settings = require('./../config/secret');

/**
 * Setup grex here
 *
 **/


var client = grex.createClient(settings.titan2);

var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;
var _ = grex._;



//gremtool.remove.all();
//gremtool.remove.edges();
//gremtool.remove.vertex();



//var createUser = function () {
//    gremtool.create({bitchNiggles: "YumYumYum", type: "random"}, function (err, result) {});
//};

//var video = {
//    //createdTime: 1420617405862,
//    length: 832221,
//    videoId: '54ace6bd13663723744514ac',
//    type: "video"
//};

//gremtool.create({createdTime: 1234, video_length: 832221, type: "video"}, function (err, result) {
//   console.log(result);
//});

//gremtool.create(video, function (err, result) {
//   console.log(result);
//});
//for(var i = 0; i < 10000; i++){
//    createUser();
//}