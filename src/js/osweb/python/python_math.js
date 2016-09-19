module.exports = function(osweb){
    "use strict";

    // Class python_math - Python math functions.      
    function python_math() {
        throw 'The class python_math cannot be instantiated!';
    }

    python_math._initialize = function() {
        // Insert math library methods into the python interpreter.
        filbert.pythonRuntime.imports['math'] = {};
        filbert.pythonRuntime.imports['math']['ceil'] = this.ceil; 
        filbert.pythonRuntime.imports['math']['copysign'] = this.copysign; 
        filbert.pythonRuntime.imports['math']['fabs'] = this.fabs; 
        filbert.pythonRuntime.imports['math']['factorial'] = this.factorial; 
        filbert.pythonRuntime.imports['math']['floor'] = this.floor; 
        filbert.pythonRuntime.imports['math']['fmod'] = this.fmod; 
        filbert.pythonRuntime.imports['math']['frexp'] = this.frexp; 
        filbert.pythonRuntime.imports['math']['fsum'] = this.fsum; 
        filbert.pythonRuntime.imports['math']['acos'] = this.acos; 
        filbert.pythonRuntime.imports['math']['asin'] = this.asin; 
        filbert.pythonRuntime.imports['math']['atan'] = this.atan; 
        filbert.pythonRuntime.imports['math']['atan2'] = this.atan2; 
        filbert.pythonRuntime.imports['math']['cos'] = this.cos; 
        filbert.pythonRuntime.imports['math']['hypot'] = this.hypot; 
        filbert.pythonRuntime.imports['math']['sin'] = this.sin; 
        filbert.pythonRuntime.imports['math']['tan'] = this.tan; 
        filbert.pythonRuntime.imports['math']['e'] = this.e; 
        filbert.pythonRuntime.imports['math']['pi'] = this.pi; 
    };
     
    // Definition of public methods - Number-theoretic and representation functions.

    python_math.e = Math.E;
    python_math.pi = Math.PI;
    
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
        return Math.acos(x);
    };

    python_math.asin = function(x) {
        return Math.asin(x);
    };

    python_math.atan = function(x) {
        return Math.atan(x);
    };

    python_math.atan2 = function(y, x) {
        return Math.atan2(y, x);
    };

    python_math.cos = function(x) {
        return Math.cos(x);
    };

    python_math.hypot = function(x, y) {
    };

    python_math.sin = function(x) {
        return Math.sin(x);
    };

    python_math.tan = function(x) {
        return Math.tan(x);
    };
 
    // Bind the python_math class to the osweb namespace.
    return python_math;
};
