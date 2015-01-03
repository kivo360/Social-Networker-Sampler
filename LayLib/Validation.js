/**
 * Created by kevin on 12/8/14.
 */


var Validation = function () {
    this.keyStack = [];
};

/**
 * Returns the parameter in boolean value
 * @param param
 * @returns {boolean}
 */
Validation.prototype.getBool = function (param) {
    return Boolean(param).valueOf();
};

/***
 * Checks if the query object is reasonable
 * @param queryObject
 * @returns {boolean}
 */
Validation.prototype.queryValidation = function (queryObject) {
    var oKey = Object.keys(queryObject);
    this.keyStack.push(oKey);
    if(oKey.lastIndexOf("type") < 0  || oKey.length > 2){
        return false;
    }
    return true;
};


Validation.prototype.lastKeySet = function () {
    return this.keyStack[this.keyStack.length - 1];
};



module.exports = Validation;

