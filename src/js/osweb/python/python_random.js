module.exports = function(osweb){
    "use strict";
    
    // Definition of the class python_random.
    function python_random() {
        throw 'The class python_random cannot be instantiated!';
    }

    python_random._initialize = function() {
        // Insert math library methods into the python interpreter.
        filbert.pythonRuntime.imports['random'] = {};
        filbert.pythonRuntime.imports['random']['random'] = this.random; 
    };
    
    // Definition of public methods 

    python_random.random = function() {
        return Math.random();
    };

    // Bind the python_string class to the osweb namespace.
    return python_random;
};
