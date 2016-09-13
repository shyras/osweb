module.exports = function(osweb){
    "use strict";
    
    // Class python_math - Python math functions.      
    function python_math() {
        throw 'The class python_math cannot be instantiated!';
    }

    // Definition of public methods - Number-theoretic and representation functions.

    python_math.ceil = function(x) {
    };

    python_math.copysign = function(x, y) {
    };

    python_math.fabs = function(x) {
    };

    python_math.factorial = function(x) {
    };

    python_math.floor = function(x) {
        return Math.floor(x);
    };

    python_math.fmod = function(x, y) {
    };

    python_math.frexp = function(x) {
    };

    python_math.fsum = function(iterable) {
    };

    // Definition of public methods - Trigonometric functions

    python_math.acos = function(x) {
    };

    python_math.asin = function(x) {
    };

    python_math.atan = function(x) {
    };

    python_math.atan2 = function(y, x) {
    };

    python_math.cos = function(x) {
    };

    python_math.hypot = function(x, y) {
    };

    python_math.sin = function(x) {
    };

    python_math.tan = function(x) {
    };
    
    // Definition of public methods - math contstants.                        
    
    python_math.e = function () {
    };

    python_math.pi = function () {
    };

    // Bind the python_math class to the osweb namespace.
    return python_math;
};
