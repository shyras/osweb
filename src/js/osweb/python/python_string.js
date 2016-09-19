module.exports = function(osweb){
    "use strict";
    
    var filbert = require('filbert');
    
    // Definition of the class python_string.
    function python_string() {
        throw 'The class python_string cannot be instantiated!';
    }

    // Definition of public methods - parse cycle.   

    python_string.capitalize = function() {
    };

    python_string.center = function(width, fillchar) {
    };

    python_string.upper = function() {
    };

    // Bind the python_string class to the osweb namespace.
    return python_string;
};
