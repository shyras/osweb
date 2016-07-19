
(function() {
    // Definition of the class response_store.
    function response_store(experiment) {
        // Definition of private properties.
        this._experiment = experiment;
	this._feedback_from = 0;
	this._responses = [];
    }; 
	
    // Extend the class from its base class.
    var p = response_store.prototype;
    
    // Definition of public methods - properties.   

    p.acc = function() {
    };    
        
    p.avg_rt = function() {
    };    
        
    p.correct = function() {
    };    

    p.feedback = function() {
    };    

    p.item = function() {
    };    
        
    p.response = function() {
    };    
        
    p.response_time = function() {
    };    
    
    p.var = function() {
    };    
        
    // Definition of public methods - edit.   

    p.add = function(response, correct, response_time, item,feedback) {
    };    
        
    p.clear = function() {
    };    
        
    p.reset_feedback = function() {
    };    
	
    // Bind the response_store class to the osweb namespace.
    osweb.response_store = response_store;
}());
