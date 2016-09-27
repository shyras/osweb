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
        filbert.pythonRuntime.imports['random']['shuffle'] = this.shuffle; 
   };
    
    // Definition of public methods 

    python_random.random = function() {
        return Math.random();
    };

    python_random.shuffle = function(x, random) {
        // Fisher-Yates (aka Knuth) Shuffle.
        var currentIndex = x.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = x[currentIndex];
            x[currentIndex] = x[randomIndex];
            x[randomIndex] = temporaryValue;
        }       
        return x;
    };

    // Bind the python_string class to the osweb namespace.
    return python_random;
};
