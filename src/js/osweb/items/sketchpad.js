/*
 * Definition of the class sketchpad.
 */

(function() 
{
    function sketchpad(pExperiment, pName, pScript)
    {
	// Set publice properties.
    	this.canvas   = new osweb.canvas(pExperiment, false);
	this.elements = [];

	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sketchpad, osweb.generic_response);

    // Definition of public properties. 
    p.canvas   = null;
    p.elements = [];

    /*
     * Definition of private methods - build cycle.         
     */
    
    p._compare = function(a,b) 
    {
        // Sort function used for determining the draw index (z-index) of alle elemente.
        if (a.z_index() < b.z_index())
            return 1;
        else if (a.z_index() > b.z_index())
            return -1;
        else 
            return 0;
    };
    
    /*
     * Definition of public methods - build cycle..         
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
    	this.elements      = [];
	this.vars.duration = 'keypress';
    };

    p.from_string = function(pString)
    {
        // Define and reset variables to their defaults.
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
                    if ((tokens.length > 0) && (tokens[0] == 'draw'))
                    {
			if (osweb.isClass(tokens[1]) == true)
			{
                            var element = osweb.newElementClass(tokens[1], this, lines[i]);
                            this.elements.push(element);	
			}	
                        else
			{
                            // error.
			}
                    }
		}
            }

            // Sort the elements usin the z-index.
            this.elements.sort(this._compare);
        }					
    };
	
    /*
     * Definition of public methods - runn cycle.         
     */

    p.prepare = function()
    {
        // Draw the elements. 
	for (var i=0; i < this.elements.length; i++)
	{
            if (this.elements[i].is_shown() == true)
            {
		this.elements[i].draw();
            }			
	}				
    
        // Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();
		
        // Set the onset and start the stimulus response process.        
	this.set_item_onset(this.canvas.show()); 
	this.set_sri(false);
	this.process_response();
    };
	
    p.complete = function()
    {
	// Clear the canvas.
	this.canvas.clear();
		
	// Inherited.	
	this.generic_response_complete();
    };

    // Bind the sketchpad class to the osweb namespace.
    osweb.sketchpad = osweb.promoteClass(sketchpad, "generic_response");
}());
