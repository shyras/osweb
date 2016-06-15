/*
 * Definition of the class mouse.
 */

(function() 
{
    function mouse(pExperiment, pTimeout, pButtonlist, pVisible)
    {
        // Set the class public properties. 
	this.experiment = pExperiment;
	this.timeout    = (typeof pTimeout === 'undefined')    ? null : pTimeout;
	this.buttonlist = (typeof pButtonlist === 'undefined') ? null : pButtonlist;	
	this.visible    = (typeof pVisible === 'undefined')    ? true : pVisible;	

	// Set the class private properties. 
	this._response     = null;
        this._synoniem_map = null;

        // Define the key conversion list.
        this._define_synoniem_map();
    }; 
	
    // Extend the class from its base class.
    var p = mouse.prototype;
    
    // Define the class public properties. 
    p.experiment = null;
    p.buttonlist = [];
    p.timeout    = -1;
    p.visible 	 = false;
	
    /*
     * Definition of class private methods.
     */

    p._define_synoniem_map = function()
    {
        // Define the map with synoniems.
        this._synoniem_map = [['1','left_button'], ['2','middle_button'], ['3','right_button'], ['4','scroll_up'], ['5','scroll_down']];
    };        

    p._get_default_from_synoniem = function(pResponses)
    {
        var defaults = [];
        for (var i = 0;i < pResponses.length;i++)
        {
            var synoniem = this.synonyms(pResponses[i]);
            defaults.push(synoniem[0]);
        }

        return defaults;    
    };

    p._set_response = function(pMouseResponse)
    {
    	// Set the last response item.
    	this._response = pMouseResponse;		
    };

    /*
     * Definition of class public methods.
     */
    
    p.default_config = function()
    {
        // Return the default configuration.
        return {'timeout'   : -1,
		'buttonlist': null,
		'visible'   : false};
    };

    p.flush = function() 
    {
	// Clears all pending mouse input, not limited to the mouse.
        osweb.debug.addMessage('OsWeb warning: the method mouse.flush() is not implemented in the current version of OsWeb.');
    };
 	
    p.get_click = function(pTimeout, pButtonlist, pVisible)
    {
	// Collects a single mouse click.
	this.timeout    = (typeof pTimeout === 'undefined')    ? this.timeout    : pTimeout;
	this.buttonlist = (typeof pButtonlist === 'undefined') ? this.buttonlist : pButtonlist;	
	this.visible    = (typeof pVisible === 'undefined')    ? this.visible    : pVisible;	

	if (this.experiment != null)
	{
            // Hide or show the mouse.
            this.show_cursor(this.visible);
	
            // Set the event processor.
            osweb.events._run(this, this.timeout, osweb.constants.RESPONSE_MOUSE, this.buttonlist);
	};
    };

    p.get_pos = function()
    {
    	// check if there is a mouse move event available.
        if (osweb.events._mouse_move !== null)
        {
            return {'rtTime': osweb.events._mouse_move.rtTime, 'x': osweb.events._mouse_move.event.clientX, 'y': osweb.events._mouse_move.event.clientY};
        }
        else
        {
            return {'rtTime': -1, 'x': -1, 'y': -1};
        }    
    };

    p.get_pressed = function()
    {
    	// Returns the current state of the mouse buttons. A True value means the button is currently being pressed.
        osweb.debug.addMessage('OsWeb warning: the method mouse.get_pressed() is not implemented in the current version of OsWeb.');
     };

    p.set_config = function(pTimeout, pButtonlist, pVisible)
    {
	// Set mouse properties.          
	this.timeout    = pTimeout;
	this.buttonlist = pButtonlist;	
	this.visible    = pVisible;	
    };

    p.set_pos = function(pPos)
    {
    	// Returns the current position of the cursor.	
        osweb.debug.addMessage('OsWeb warning: the method mouse.set_pos() is not implemented in the current version of OsWeb.');
    };

    p.show_cursor = function(pVisible)
    {
    	// Set the property
	this.visible = pVisible;
		
	// Immediately changes the visibility of the mouse cursor.	
	if (pVisible == true)
	{
            // Show the mouse cursor.
            osweb.runner._stage.canvas.style.cursor = "default";
	}
	else
	{
            // Set the cursor visibility to none.
            osweb.runner._stage.canvas.style.cursor = "none";
        }
    };

    p.synonyms = function(pButton)
    {
        if (typeof pButton !== 'undefined')
        {
            for (var i = 0;i < this._synoniem_map.length;i++)
            {
                for (var j = 0;j < this._synoniem_map[i].length;j++)
                {
                    if (this._synoniem_map[i][j] == pButton)
                    {
                        return this._synoniem_map[i];
                        break;
                    }
                }   
            }
        }
        else
        {
            return null;
        }    
    };

    // Bind the mouse class to the osweb namespace.
    osweb.mouse = mouse;
}()); 

