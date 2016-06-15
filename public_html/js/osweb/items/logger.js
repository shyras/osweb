
/*
 * Definition of the class logger.
 */

(function() 
{
    function logger(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._logvars = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(logger, osweb.item);

    // Definition of public properties. 
    p.description = 'Logs experimental data';
    p.logvars	  = [];
	
    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this._logvars      = null;
	this.logvars       = [];
	this.vars.auto_log = 'yes';
    };

    p.from_string = function(pString)
    {
	// Parses a definition string.
	this.variables = {};
	this.comments  = [];
	this.reset();

	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'log') && (tokens.length > 0))
                    {
			this.logvars.push(tokens[1]);
                    }	
		}
            }
        }
    };	

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function()
    {
	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
	{
            // item is finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            this.set_item_onset();
            if (this._logvars == null)
            {
		if (this.vars.auto_log == 'yes')
		{
                    this._logvars = this.experiment._log.all_vars();
		}
		else
		{
                    this._logvars = [];
                    for (variable in this.logvars)
                    {
 			if ((variable in this._logvars) == false)
 			{
                            this._logvars.push(variable);
			}
                    }
                    this._logvars.sort();		
		}
            }
            this.experiment._log.write_vars(this._logvars); 

            // Complete the cycle.
            this.complete();
        };
    };

    p.complete = function()
    {
        // Inherited.	
        this.item_complete();
    };

    // Bind the logger class to the osweb namespace.
    osweb.logger = osweb.promoteClass(logger, "item");
}());
