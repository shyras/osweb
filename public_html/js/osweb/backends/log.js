/*
 * Definition of the class log.
 */

(function() 
{
    function log(pExperiment, pPath)
    {
    	// Define and set the private properties. 
	this._all_vars       = null;
	this._header_written = false;	
	this._log            = [];
	this._path           = '';

        // set the class properties. 
	this.experiment              = pExperiment;
	this.experiment.vars.logfile = pPath;
    }; 
	
    // Extend the class from its base class.
    var p = log.prototype;
    
    // Set the class default properties. 
    p.experiment = null;
	
    /*
     * Definition of public class methods.   
     */

    p.all_vars = function()
    {
	// Retrieves a list of all variables that exist in the experiment.
	if (this._all_vars == null)
	{
            this._all_vars = this.experiment.vars.inspect();
	}
		
	return this._all_vars;
    };

    p.close = function()
    {
        console.log ('?');
        console.log(this._log);
        
	// Closes the current log.
	if (this._log.length > 0) 
	{
            console.log(this._log.join(''));
        }

	// Clear the log file.
	this._log = [];
    };

    p.flush = function()
    {
    	// Flush the log file.
        this._log = [];
    };

    p.open = function(pPath)
    {	
	// Opens the current log. If a log was already open, it is closed.
	this._header_written = false;
	this._path           = pPath; 
	
	// Check for old data.
	if (this._log != null)
	{
            // Clear the old data.
            this.close();
	}
    };

    p.write = function(pMsg, pNewline)
    {
    	// Write one message to the log.
	pNewline = (typeof pNewline === 'undefined') ? true : pNewline;
	
	// Write a new line.
	if (pNewline == true)
	{
            this._log.push(pMsg + '\n');
	}
	else
	{
            // Write the Message line.
            this._log.push(pMsg);
	}
    };

    p.write_vars = function(pVar_list)
    {
    	// Writes variables to the log.
	pVar_list = (typeof pVar_list === 'undefined') ? null : pVar_list;
		
	var value, variable; 
	var l = [];
			
	if (pVar_list == null)
	{
            pVar_list = this.all_vars();
	}

        // Sort the var list.
        pVar_list.sort();
        
	if (this._header_written == false)
	{
            for (var i=0; i < pVar_list.length; i++)
            {
		//l.push('"' + pVar_list[i] + '"');
		l.push(pVar_list[i]);
            }		
            this.write(l.join());
            this._header_written = true;
	}
		
	l = [];
	for (var i=0; i < pVar_list.length; i++)
	{
            value = this.experiment.vars.get(pVar_list[i], 'NA', false);
            //l.push('"' + value + '"');
            l.push(value);
	}
	this.write(l.join());
    };
 	
    // Bind the log class to the osweb namespace.
    osweb.log = log;
}());

