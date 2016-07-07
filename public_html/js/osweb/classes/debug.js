
/*
 * Definition of the class debug.
 */

(function() 
{
    function debug() 
    {
    	throw "The class debug cannot be instantiated!";
    }

    // Definition of public properties.
    debug.enabled    = false;
    debug.error      = false;
    debug.messageLog = new Array();

    /*
     * Definition of class methods.               
     */

    debug._initialize = function()
    {
    	// Clear the log.
    	this.messageLog = [];
    };	

    debug._finalize = function()
    {
	// If enabled add the log to the javascript console.
	if (this.enabled == true)
	{
            console.log(this.messageLog);			
	}

	// Clear the log.
	this.messageLog = [];
    };

    /*
     * Definition of the public methods.               
     */

    debug.addError = function(pErrorText)
    {
    	// Set the error flag.
    	this.error = true;

        // Show the fatal error warning.
	console.log(pErrorText);
	console.log(osweb.constants.ERROR_001);

	// throw the exception.
	throw new Error(pErrorText);	
    };
	
    debug.addMessage = function(pMessageText)
    {
        // Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    debug.msg = function(pMessageText)
    {
	// Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    // Bind the debug class to the osweb namespace.
    osweb.debug = debug;
}());
