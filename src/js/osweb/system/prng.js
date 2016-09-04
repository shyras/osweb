"use strict";
/*
* Definition of the class prng.
*/
var uheprng = require('random-seed');

function prng() {
    throw "The class prng cannot be instantiated!";
};

// Set the class private properties. 
prng._previous = 0;
prng._prng = uheprng();
prng._seed = '0';

/*
 * Definition of class methods - run cycle.   
 */

prng._initialize = function() {
    // Create the random seed. 
    this._prng.initState();
    this._prng.hashString(this._seed);
};

/*
 * Definition of class methods.   
 */

prng._getNext = function() {
    // Get the next random number.
    this._previous = (this._prng(1000000000000000) / 1000000000000000);

    // Return function result.
    return this._previous;
};

prng._getPrevious = function() {
    // Return function result.
    return this._previous;
};

prng._getSeed = function() {
    // Return the current seed value.
    return this._seed;
};

prng._random = function(pMin, pMax) {
    // Calculate the range devider.
    var devider = (1 / ((pMax - pMin) + 1));

    // Get the random number and devide it.
    this._previous = ((this._prng(1000000000000000) / 1000000000000000));

    // Set the devider.
    this._previous = pMin + Math.floor(this._previous / devider);

    // Return function result. 
    return this._previous;
};

prng._reset = function() {
    // Set the random seed value to 0. 
    this._seed = '0';

    // Reset the PRNG range.
    this._prng.initState();
    this._prng.hashString(String(this._seed));
};

prng._setSeed = function(pSeed) {
    // Set the random seed value. 
    this._seed = String(pSeed);

    // Reset the PRNG range.
    this._prng.initState();
    this._prng.hashString(this._seed);
};

// Bind the prng class to the osweb namespace.
module.exports = prng;