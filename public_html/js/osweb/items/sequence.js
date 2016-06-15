
/*
 * Definition of the class sequence.
 */

(function() 
{
    function sequence(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._index    = -1;
	this._items    = null;
        this._keyboard = null;    
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sequence, osweb.item);

    // Definition of public properties. 
    p.description    = 'Runs a number of items in sequence';
    p.flush_keyboard = 'yes';
    p.items          = null;
	
    /*
     * Definition of public methods - build cycle.         
     */

    p.reset = function()
    {
	// Resets all item variables to their default value..
	this.items               = [];
	this.vars.flush_keyboard = 'yes';
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
                    if ((tokens.length > 0) && (tokens[0] == 'run'))
                    {
                        var item = tokens[1];
			var cond = 'always';
			if (tokens.length > 2)
			{
                            cond = tokens[2];
			}	

			// Push the item and condition definition to the items list.
			this.items.push({'item': item, 'cond': cond});
                    }	
            	} 
            }
	}					
    };

    /*
     * Definition of public methods - run cycle.         
     */

    p.prepare = function()
    {
	// Inherited.	
	this.item_prepare();
	
        // Create a keyboard to flush responses at the start of the run phase
	if (this.vars.flush_keyboard == 'yes')
        {	
            this._keyboard = new osweb.keyboard(this.experiment);
        }
        else
        {    
            this._keyboard = null;
        }    
	
        // Generate the items list for the run cycle.
        this._index = 0;
	this._items = [];
	for (var i=0; i < this.items.length; i++)
	{
            if ((this.items[i].item in osweb.item_store._items) === false)
            {
		osweb.debug.addError('Could not find item ' + this.items[i].item.name + ' which is called by sequence item ' + this.name);
            }
            else 
            {
                // Prepare the items.
                osweb.item_store.prepare(this.items[i].item);
		
                // Add the item to the internal list.
                this._items.push({'item': this.items[i].item, 'cond': osweb.syntax.compile_cond(this.items[i].cond)});
            }
	}	
    };

    p.run = function()
    {
        // Inherited.	
        this.item_run();

        // Check if all items have been processed.
        if (this._index < this._items.length)
        {
            // Flush the keyboard at the beginning of the sequence.
            if ((this._index == 0) && (this.vars.flush_keyboard == 'yes'))
            {
                this._keyboard.flush();
            }

            // Increase the current index.
            this._index++;

            // Set the workspace.
            osweb.python_workspace['self'] = this;

            // Check if the item may run.                            
            if (osweb.python_workspace._eval(this._items[this._index - 1].cond) == true) 
            {   
                // run the current item of the sequence object.
		osweb.item_store.run(this._items[this._index - 1].item, this);
            }
  	    else
  	    {
  	    	// Execute the next cycle of the sequnce itself.
  	    	this.run();	
  	    }
	}
	else
	{
            // sequence is finalized.
            this.complete();
        }
    };
	
    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };

    // Bind the sequence class to the osweb namespace.
    osweb.sequence = osweb.promoteClass(sequence, "item");
}());
