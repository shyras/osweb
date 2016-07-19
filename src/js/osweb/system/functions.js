
(function() {
    // Definition of the class functions.
    function functions() {
	throw 'The class functions cannot be instantiated!';
    }

    // Definition of private methods.   

    functions._initialize = function() {
	// Create the general function calls for use in the inlide script item.
	window['print'] = this.print;
	window['randint'] = this.randint;
    };
		
    // Definition of public methods - global inline functions.

    functions.print = function(text) {
	console.log('print output:' + text);
    };

    functions.randint = function(start, end) {
        var multiplier = end - start;
        var rand = Math.floor(Math.random() * multiplier);
        return rand + start;
    };

    // Bind the functions class to the osweb namespace.
    osweb.functions = functions;
}()); 

