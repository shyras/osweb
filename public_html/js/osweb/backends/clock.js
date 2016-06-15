/*
 * Definition of the class clock.
 */

(function() 
{
    function clock(pExperiment)
    {
        // Define and set the private properties. 
        this._startTime = this._now();
		
        // Set the class public properties. 
	this.experiment = pExperiment;
    }; 
	
    // Extend the class from its base class.
    var p = clock.prototype;
    
    // Define the class public properties. 
    p.experiment = null;

    /*
     * Definition of class private methods.   
     */
    
    p._now = function() 
    {
	// Get the current time stamp using the best available timing method.
	if (window.performance.now) 
	{
            return Math.round(window.performance.now());
	} 
	else if (window.performance.webkitNow) 
	{
            return Math.round(window.performance.webkitNow());
	} 
	else 
	{
            return new Date().getTime();
	}
    };

    /*
     * Definition of public class methods.   
     */

    p.initialize = function()
    {
        // Set the absolute start time of the expeirment.
        this._startTime = this._now();
    };

    p.sleep = function(pMs) 
    {
        // Sleeps (pauses) for a period.
	if (this.experiment !=  null)
	{
            // Set the event processor.
            osweb.events._run(this, pMs, osweb.constants.RESPONSE_DURATION, null);
	}
    };
	
    p.time = function() 
    {
        // Gives a current timestamp in milliseconds. 
        if (this._startTime != -1)
        {
            return (this._now() - this._startTime);
        }    
        else
        {
            return 0;
        }    
    };
 	
    // Bind the clock class to the osweb namespace.
    osweb.clock = clock;
}());

