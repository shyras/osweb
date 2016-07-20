(function() {
    // Definition of the class response_info.
    function response_info(response_store, response, correct, response_time, item, feedback) {};

    // Extend the class from its base class.
    var p = response_info.prototype;

    // Definition of public methods - properties.   

    p.match = function(kwdict) {};

    p.matchnot = function(kwdict) {};

    // Bind the response_info class to the osweb namespace.
    osweb.response_info = response_info;
}());