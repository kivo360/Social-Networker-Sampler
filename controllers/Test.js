/**
 * Created by kevin on 2/1/15.
 */
var tokenStuff = require('./../general/token');

exports.checkToken = function (req, res) {
    var t = req.body.token;
    var toke;
    try{
        toke = tokenStuff.validate(t);
    }catch (err){
        console.log(err);
        res.json({error: "Your shit stank"})
        //Log to machine
        return;
    }

    res.json(toke);
};

// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lIjoxNDIyNzk5OTQ0MTY5LCJ1c2VySWQiOjEwMjQzMDcyLCJmaXJzdCI6IktldmluIiwibGFzdCI6IkhpbGwifQ.AQuIuRFwC_UjCZoyHyCtcOt17_8yYZW5_hq_PmeDYaI