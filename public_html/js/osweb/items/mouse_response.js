
/*
 * Definition of the class mouse_response.
 */

(function() 
{
    function mouse_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
	this._flush = 'yes';
	this._mouse = new osweb.mouse(this.experiment);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(mouse_response, osweb.generic_response);

    // Definition of public properties. 
    p.description = 'Collects mouse responses';
    p.resp_codes  = {};
	
    /*
     * Definition of public methods - build cycle.
     */
	
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.auto_response          = 1;
	this.process_feedback       = true;
	this.resp_codes             = {};
	this.resp_codes['0']        = 'timeout';
	this.resp_codes['1']        = 'left_button';
	this.resp_codes['2']        = 'middle_button';
	this.resp_codes['3']        = 'right_button';
	this.resp_codes['4']        = 'scroll_up';
	this.resp_codes['5']        = 'scroll_down';
	this.vars.allowed_responses = null;
	this.vars.correct_response  = null;
	this.vars.duration          = 'mouseclick';
	this.vars.flush             = 'yes';
	this.vars.show_cursor       = 'yes';
	this.vars.timeout           = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {	
	// Set the internal flush property.
	this._flush = (this.vars.flush) ? this.vars.flush : 'yes';
 
        // Inherited.	
	this.generic_response_prepare();
   };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();

        // Record the onset of the current item.
	this.set_item_onset(); 
        
	// Show the cursor if defined.
        if (this.vars.show_cursor == 'yes')
	{	
            this._mouse.show_cursor(true);
        }

	// Flush responses, to make sure that earlier responses are not carried over.
	if (this._flush == 'yes')
	{	
            this._mouse.flush();
	}		
    
        this.set_sri();
        this.process_response();
    };

    p.complete = function()
    {
        // Hide the mouse cursor.    
        this._mouse.show_cursor(false);
       
        // Inherited.	
        this.generic_response_complete();
    };

    // Bind the mouse_response class to the osweb namespace.
    osweb.mouse_response = osweb.promoteClass(mouse_response, "generic_response");
}());
