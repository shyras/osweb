
/*
 * Definition of the class inline_script.
 */

(function() 
{
    function inline_script(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
	
	// Define and set the public properties. 
	this._prepare_tree = null;
	this._run_tree     = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(inline_script, osweb.item);

    // Define and set the public properties. 
    p.description = 'Executes Python code';

    /*
     * Definition of private methods - compiling script.
     */

    p._compile = function(pScript)
    {
        if (pScript != '')
        {
            var locations = false;
            var parseFn   = filbert_loose.parse_dammit;
            var ranges    = false;
        		
            try 
	    {
        	var code  = pScript;
         	var ast   = parseFn(code, { locations: locations, ranges: ranges });
        
	       	return ast;
    	    }
       	    catch (e) 
            {
        	console.log('error');
        	console.log(e.toString());
    	   	
                return null;
            }
	}
	else
	{
            return null;
        }	   	
    };

    /*
     * Definition of public methods - building item.         
     */
		
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this._var_info     = null;
	this.vars._prepare = '';
	this.vars._run     = '';
    };

    p.from_string = function(pString)
    {
    	// Parses a definition string.
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var read_run_lines     = false;
            var read_prepare_lines = false;
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		var tokens = osweb.syntax.split(lines[i]);
			
		if ((tokens != null) && (tokens.length > 0))
		{
                    switch (tokens[0])
                    {
			case 'set': 
                            this.parse_variable(lines[i]);
                            
                        break;
			case '__end__':
                            read_run_lines     = false;
                            read_prepare_lines = false;
                            
			break;	
			case '___prepare__':
                            read_prepare_lines = true;
                            
			break;
			case '___run__':
                            read_run_lines = true;
                            
			break;
			default:
                            if (read_run_lines == true)
                            {
				this.vars._run = this.vars._run + lines[i] + '\n';
                            }
                            else if (read_prepare_lines == true)
                            {
                            	this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                            }
                    }
		}
		else 
		{
                    if (read_run_lines == true)
                    {
			this.vars._run = this.vars._run + lines[i] + '\n';
                    }
                    else if (read_prepare_lines == true)
                    {
			this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                    }
            	} 
            }
	}
    };

    /*
     * Definition of public methods - running item.         
     */

    p.prepare = function()
    {
	// Inherited.	
	this.item_prepare();
	
	// Compile the python script code.
	this._prepare_tree = osweb.parser._prepare(this.vars._prepare);
	this._run_tree     = osweb.parser._prepare(this.vars._run);
		
        // Execute the run code.
 	if (this._prepare_tree != null)
    	{
            // Start the parser
            // osweb.parser._run(this, this._prepare_tree);    		
        }
    };

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
        
        // Record the onset of the current item.
	this.set_item_onset(); 

        // Execute the run code.
 	if (this._run_tree != null)
    	{
            // Start the parser
            osweb.parser._run(this, this._run_tree);    		
    	}
    };
    
    p.complete = function()
    {
        // Check if the parser is ready. 
        if (osweb.parser._status == 1)
        {
            // Set parent node.
            osweb.parser._current_node = osweb.parser._current_node.parent;

            // Set the parser status.
            osweb.parser._process_node();
        }
        else
        {    
            // Inherited.           
            this.item_complete();
        }    
    }; 
	
    // Bind the Sequence class to the osweb namespace.
    osweb.inline_script = osweb.promoteClass(inline_script, "item");
}());
