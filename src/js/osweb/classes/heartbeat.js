/*
 * Definition of the class heartbeat.
 */

(function() 
{
    function heartbeat(pExperiment, pInterval)
    {
        // Set the class public properties. 
    	this.experiment = pExperiment;
	this.interval   = (typeof pInterval === 'undefined') ? 1 : pInterval;	
    }; 
	
    // Extend the class from its base class.
    var p = heartbeat.prototype;
    
    // Define the class public properties. 
    p.experiment = null;
    p.interval   = -1;

    /*
     * Definition of class private methods.   
     */

    p.beat = function()
    {
    };

    p.run = function()
    {
    };

    p.start = function()
    {
    };
	
    // Bind the heartbeat class to the osweb namespace.
    osweb.heartbeat = heartbeat;
}());
