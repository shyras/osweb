
/*
 * Definition of the class events.   
 */

(function() 
{
    function events()
    {
    	throw "The class events cannot be instantiated!";
    }; 
	
    // Definition of private properties.
    events._active         = false;                             // If true event processing is active.
    events._caller	   = null;                              // The caller object (clock, keyboard, mouse).
    events._current_item   = null;				// Contain the current active item. 			
    events._keyboard_mode  = osweb.constants.PRESSES_ONLY;      // Keyboard collecting mode (down/up/both).
    events._keyboard_event = null;                              // Contains the last known keyboard event.
    events._mouse_mode     = osweb.constants.PRESSES_ONLY;      // Mouse collecting mode (down/up/both).
    events._mouse_event    = null;				// Contains the last known mouse event.	
    events._mouse_move     = null;                              // Contains the last known mouse move event (used within the mouse class).
    events._response_given = false;				// Valid response toggle
    events._response_type  = -1;				// Set type of response (0 = none, 1 = keyboard, 2 = mouse, 3 = sound). 
    events._response_list  = null;	                        // Items to respond on.
    events._sound_ended    = false;				// Sound play is finished.
    events._timeout        = -1;                                // Duration for timeout.
    events._video_ended    = false;				// Video play is finished.
    
    // Convert keyCode with special keys to a unique value.
    events.keyCodes  = ['','','','','','','help','','backspace','tab','','','clear','enter','enter_special','','shift','ctrl','alt','pause',   // 00  .. 19
                        'caps','','','','','','','escape','','','','','space','page up','page down','end','home','left','up','right',          // 20  .. 39
                        'down','select','print','execute','print screen','insert','delete','','0','1','2','3','4','5','6','7','8','9',':',';', // 40  .. 59
                        '<','=','>','?','@','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o',                                       // 60  .. 79
                        'p','q','r','s','t','u','v','w','x','y','z','left meta','right meta','menu','','','kp0','kp1','kp2','kp3',             // 80  .. 99
                        'kp4','kp5','kp6','kp7','kp8','kp9','kp_multiply','kp_plus','','kp_minus','kp_period','kp_divide','f1','f2','f3','f4','f5','f6','f7','f8', // 100 .. 119
                        'f9','f10','f11','f12','','','','','','','','','','','','','','','','',                                                // 120 .. 139
                        '','','','','numlock','scrollock','','','','','','','','','','','','','','',                                           // 140 .. 159
                        '^','!','"','#','$','%','&','_','(',')','*','+','|','_','{','}','~','','','',                                          // 160 .. 179
                        '','','','','','',';','=',',','-','.','/','`','','','','','','','',                                                    // 180 .. 199
                        '','','','','','','','','','','','','','','','','','','','[',                                                          // 200 .. 219
                        '\\',']','\'','','','','','','','','','','','','','','','','','',                                                      // 220 .. 239
                        '','','','','','','','','','','','','','','',''];                                                                      // 240 .. 255
    events.keySCodes = ['','','','','','','','','','','','','','','','','','','','pause',                                                      // 00  .. 19
                        '','','','','','','','','','','','','','','','','','','','',                                                           // 20  .. 39
                        '','','','','','','','',')','!','@','#','$','%','^','&','*','(','',':',                                                // 40  .. 59
                        '','+','','','','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o',                                           // 60  .. 79
                        'p','q','r','s','t','u','v','w','y','z','','','','','','','','','','',                                                 // 80  .. 99
                        '','','','','','','','','','','','','','','','','','','','',                                                           // 100 .. 119
                        '','','','','','','','','','','','','','','','','','','','',                                                           // 120 .. 139
                        '','','','','','','','','','','','','','','','','','','','',                                                           // 140 .. 159
                        '','','','','','','','','','','','','','_','','','','','','',                                                          // 160 .. 179
                        '','','','','','','','','<','','>','?','~','','','','','','','',                                                       // 180 .. 199
                        '','','','','','','','','','','','','','','','','','','','{',                                                          // 200 .. 219
                        '|','}','"','','','','','','','','','','','','','','','','','',                                                        // 220 .. 239
                        '','','','','','','','','','','','','','','',''];                                                                      // 240 .. 255
   
    /*
     * Definition of class methods (life cycle).   
     */

    events._initialize = function()
    {
	// Initialize the keyboard event listeners.
        window.addEventListener("keydown", this._keyDown.bind(this), false); 
        window.addEventListener("keyup"  , this._keyUp.bind(this)  , false);

	// Initialize the mouse event listeners.
    	osweb.runner._canvas.addEventListener("mousedown", this._mouseDown.bind(this), false);
	osweb.runner._canvas.addEventListener("mousemove", this._mouseMove.bind(this)  , false);
	osweb.runner._canvas.addEventListener("mouseup"  , this._mouseUp.bind(this)  , false);

	// Initialize the tick event listener.
	createjs.Ticker.setInterval(15);
	createjs.Ticker.addEventListener("tick", this._tick.bind(this));	
    };
 
    events._finalize = function()
    {
    	// Finalize the tick event listener.             
	createjs.Ticker.removeEventListener("tick");

	// Finalize the mouse event listeners.
	osweb.runner._canvas.removeEventListener("mousedown", this._mouseDown, false);
	osweb.runner._canvas.removeEventListener("mousemove", this._mouseMove, false); 
	osweb.runner._canvas.removeEventListener("mouseup"  , this._mouseUp  , false); 

	// Finalize the keyboard event listeners.
        window.removeEventListener("keydown", this._keyDown, false);
	window.removeEventListener("keyup"  , this._keyUp  , false);
    };
	
    events._run = function(pCaller, pTimeout, pResponse_type, pResponse_list)
    {
	// Activate the event running mechanism.
	this._caller        = pCaller;
	this._response_list = pResponse_list;
	this._response_type = pResponse_type;
	this._timeout       = pTimeout;

	// Activate the ticker process.
	this._response_given = false;
	this._sound_ended    = false;							    
	this._video_ended    = false;
        this._active         = true;	
    };

    events._update = function()
    {
    	// Check if the duration is finisdhed.
   	if (((this._timeout === -1) && (this._response_given === true)) ||
   	    ((this._timeout === -1) && (this._sound_ended === true)) || 
   	    ((this._timeout === -1) && (this._video_ended === true)) || 
            ((this._timeout > 0) && ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) || (this._response_type === osweb.constants.RESPONSE_MOUSE)) && (this._response_given === true)) ||
            (((this._timeout > 0) && (this._current_item.clock.time() - this._current_item.experiment.vars.get('time_' + this._current_item.name)) > this._timeout)))  	   	
        {
            this._current_item._status = osweb.constants.STATUS_FINALIZE;
  	}
        else
        {
            // Update the current item.
            this._current_item.update();
        }    
    };
    
    events._complete = function()
    {
        // Disable the ticker
        this._active = false;
        
        // Remove the items from the general stack.
	osweb.item_stack.pop();

        // Execute the post-run phase after duration is finished or response is received.
	this._current_item.complete();
    };

    /*
     * Definition of class methods (keyboard events).   
     */
	
    events._convertKeyCode = function(pEvent)
    {
        // Check for special characters
        var key = '';
        if ((pEvent.shiftKey === true) && (pEvent.keyCode !== 16))
        {
            // Shift key pressed with other key, so convert shift keys.
            key = this.keySCodes[pEvent.keyCode];
        } 
        else if ((pEvent.shiftKey === true) && (pEvent.keyCode === 16))
        {
            // Shift code pressed, check for location (left or right)
            key = (pEvent.location == 1) ? 'lshift' : 'rshift'; 
        } 
        else if ((pEvent.ctrlKey === true) && (pEvent.keyCode === 17))
        {
            // Ctrl code pressed, check for location (left or right)
            key = (pEvent.location == 1) ? 'lctrl' : 'rctrl'; 
        } 
        else if ((pEvent.altKey === true) && (pEvent.keyCode === 18))
        {
            // Alt code pressed, check for location (left or right)
            key = (pEvent.location == 1) ? 'lalt' : 'ralt'; 
        } 
        else
        {
            // Convert standard keycode.
            key  = this.keyCodes[pEvent.keyCode];
        } 
        
        // Return function result.
        return key;
    };
        
    events._keyDown = function(pEvent) 
    {
        // Store the keyboard event.    
	this.keyboard_event = pEvent;

        // Only select this event when the collection mode is set for this.
    	if ((this._keyboard_mode === osweb.constants.PRESSES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES))
    	{
            // Process the event.
            this._processKeyboardEvent(pEvent,1);
    	} 
    };	 

    events._keyUp = function(pEvent) 
    {
    	// Only select this event when the collection mode is set for this.
    	if ((this._keyboard_mode === osweb.constants.RELEASES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES))
    	{
            // Process the event.
            this._processKeyboardEvent(pEvent,0);
    	} 	 
    };

    events._processKeyboardEvent = function(pKeyboardEvent, pKeyboardState)
    {
        // Create a new keyboard response object.
        var KeyboardResponses = {'event': pKeyboardEvent, 'rtTime':  osweb.runner.experiment.clock.time(), 'state': pKeyboardState, 'type': osweb.constants.RESPONSE_KEYBOARD};
      
        // Convert response to proper keyboard token. 
        KeyboardResponses.resp = this._convertKeyCode(pKeyboardEvent);
        
        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) && ((this._response_list === null) || (this._response_list.indexOf(KeyboardResponses.resp) >= 0))) 
        {
            // Set the caller response.
            this._caller._set_response(KeyboardResponses);        	

            // Process the current item.
	    if (this._current_item !== null) 
    	    {
                // Process the response.
                this._current_item.update_response(KeyboardResponses);
            } 	 
        
            // Set the valid response given toggle.
            this._response_given = true;
        }
    };
	
    /*
     * Definition of class methods (mouse events).   
     */
 
    events._mouseDown = function(pEvent) 
    {
        // Store the mouse event. 
	this.mouse_event = pEvent;

	// Only select this event when the collection mode is set for this.
    	if ((this._mouse_mode === osweb.constants.PRESSES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES))
    	{
            // Process the event.
            this._processMouseEvent(pEvent,1);
    	}	
    };	

    events._mouseMove = function(pEvent) 
    {
        // Set the mouse coordinates.
        this._mouse_move = {'event': pEvent, 'rtTime': osweb.runner.experiment.clock.time()};
    };	

    events._mouseUp = function(pEvent) 
    {
	// Only select this event when the collection mode is set for this.
    	if ((this._mouse_mode === osweb.constants.RELEASES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES))
    	{
            // Process the event.
            this._processMouseEvent(pEvent,0);
    	} 	
    };

    events._processMouseEvent = function(pMouseEvent, pMouseState)
    {
        // Create a new mouse response object.
        var MouseResponses = {'event': pMouseEvent, 'rtTime': osweb.runner.experiment.clock.time(), 'state': pMouseState, 'type': osweb.constants.RESPONSE_MOUSE};
     	
     	// Adjust mouse response.  
     	MouseResponses.resp = String(pMouseEvent.button + 1);  
     	 
        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_MOUSE) && ((this._response_list === null) || (this._response_list.indexOf(MouseResponses.resp) >= 0))) 
        {
            // Set the caller response.
            this._caller._set_response(MouseResponses);        	

            // Process the response to the current object.
            if (this._current_item !== null)
            {
                this._current_item.update_response(MouseResponses);
            }   

            // Set the valid response given toggle.
            this._response_given = true;
	}
    };
	
    /*
     * Definition of class methods (sound events).   
     */

    events._audioEnded = function()
    {
        // If duration isequal to sound exit the sound item.
        osweb.events._sound_ended = true;
    };

    /*
     * Definition of class methods (video events).   
     */

    events._videoEnded = function()
    {
    };

    events._videoPlay = function(event)
    {
    };

    /*
     * Definition of class methods (tick events).   
     */

    events._tick = function(event) 
    {
    	// Only check for status if there is a current item and the ticker is activated.
        if ((this._current_item !== null) && (this._active === true)) 
	{
            switch (this._current_item._status)
            {
                case osweb.constants.STATUS_FINALIZE:

                    // End action. Complete current active item.
                    events._complete();

                break;
		default:
                    
                    // Default action, update section of the current active item.
                    events._update();
            }
	}
    };	 

    // Bind the events class to the osweb namespace.
    osweb.events = events;
}());

/*
 * Definition of the class Parameters.
 */

(function() 
{
    function parameters()
    {
	throw "The class parameters cannot be instantiated!";
    } 

    // Set the private properties. 
    parameters._itemCounter = 0;
    parameters._parameters  = new Array();

    // Set the public properties. 
    parameters.displaySummary   = false;
    parameters.useDefaultValues = false;

    /*
     * Definition of private methods - initialize parameters.   
     */

    parameters._initialize = function()
    {
      	// Set properties if defined.
    	var parameter = {dataType: '0', defaultValue: '0', name: 'subject_nr', prompt: 'Please enter the subject number', promptEnabled: true};
        
        // Add the subject parameter to the parameters list.
        this._parameters.push(parameter);
    };

    /*
     * Definition of private methods - process parameters.   
     */
    
    parameters._processParameters = function()
    {
    	// Process all items for which a user input is required.
        if (this._itemCounter < this._parameters.length)
        {	
            // Process the Parameter.
            if (this.useDefaultValues == false)
            {
                this._processParameter(this._parameters[this._itemCounter]);
            }
            else
            {
                // Transfer the startup info to the context.
                this._transferParameters();
            }    
        }
        else
        {
            // All items have been processed, contine the Runner processing.
            if (this.displaySummary == true) 
            {
                // Show a summary of the the startup information. 
                this._showParameters();
            }
            else
            {            
                // Transfer the startup info to the context.
                this._transferParameters();
            }
        }
    };

    parameters._processParameter = function(parameter)
    {
        // Check if a user request is required.
        if (parameter.promptEnabled == true)
        {
            this._showDialog(parameter.dataType);

            // Set the dialog interface.
            if (parameter.response == '')
            {
            	document.getElementById('qpdialoginput').value = parameter.defaultValue;
            }
            else
            {
            	document.getElementById('qpdialoginput').value = parameter.defaultValue;
            }

            document.getElementById('dialogboxhead').innerHTML = parameter.prompt;
            document.getElementById('qpbuttonyes').onclick = function()
            {
                // Get the response information
                parameter.response = document.getElementById('qpdialoginput').value;
                            
                // Close the dialog.
                this._hideDialog();
            
                // Increase the counter.
                this._itemCounter++;

                // Continue processing.
                this._processParameters();

            }.bind(this);
        	
            document.getElementById('qpbuttonno').onclick = function()
            {
                // Close the dialog.
	        this._hideDialog();
                
   		// Finalize the introscreen elements.
		osweb.runner._finalizeIntroScreen();

          	// Return to the QPrime object
		// osweb.Runner._finalize();

            }.bind(this);
        }
        else
        {
            // Assign default value to the Startup item.
            parameter.response = parameter.defaultValue;
           
            // Increase the counter.
            this._itemCounter++;

            // Continue processing.
            this._processParameters();
        }    
    };

    parameters._showParameters = function()
    {
        document.getElementById('dialogboxhead').innerHTML = 'Summary of startup info';
        document.getElementById('qpbuttonyes').onclick = function()
	{
            // Close the dialog.
	    this._hideDialog();
                        
            // Transfer the startup info to the context.
            this._transferParameters(); 
        
        }.bind(this);    
        
        document.getElementById('qpbuttonno').onclick = function()
	{
            // Close the dialog.
            this._hideDialog();
                       
            // Reset the item counter.
            this._itemCounter = 0;
                        
            // Restat the input process.    
            this._processParameters(); 
            
        }.bind(this);    

        document.getElementById('qpbuttoncancel').onclick = function()
	{
            // Close the dialog.
	    this._hideDialog();
        
            // Finalize the introscreen elements.
            osweb.runner._finalizeIntroScreen();
    
            // Return to the QPrime object
            // osweb.Runner._finalize();

        }.bind(this);    
       
  	// Set the dialog interface.
        var TmpString = '';
        for (var i=0;i < this._parameters.length;i++)
        {
            if ((this._parameters[i].enabled != 0) && (this._parameters[i].promptEnabled != 0))
            {
		TmpString = TmpString + this._parameters[i].name + ': ' + this._parameters[i].response + '\r\n';  	        	
            }
        }

        document.getElementById('qpdialogtextarea').innerHTML = TmpString;
    };

    parameters._transferParameters = function()
    {
    	// Transfer the startup info items to the context.
        for (var i=0;i < this._parameters.length;i++)
        {
            osweb.runner.experiment.vars.set(this._parameters[i].name,this._parameters[i].response);
        }
        
	// Parameters are processed, next phase.
        osweb.runner._prepareStartScreen();
    };
    
    /*
     * Definition of class methods (dialogs).   
     */
     
    parameters._showDialog = function(dialogType) 
    {
        var dialogoverlay = document.getElementById('dialogoverlay');
	var dialogbox     = document.getElementById('dialogbox');
		                
	dialogoverlay.style.display = "block";
	dialogoverlay.style.height  = window.innerHeight + "px";
	dialogbox.style.left        = (window.innerWidth / 2) - (400 * .5) + "px";
	dialogbox.style.top         = "200px";
	dialogbox.style.display     = "inline";

	switch (dialogType)
        {
	    case "0": 
                document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
	    	document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "1": 
	        document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
		document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "2": 
	        document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
		document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "3": 
	        document.getElementById('dialogboxbody').innerHTML = '<textarea id="qpdialogtextarea"></textarea>';
                document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Yes</button><button id="qpbuttonno">No</button><button id="qpbuttoncancel">Cancel</button>';
                document.getElementById('qpdialogtextarea').focus();
            break;
	}
        
    };
	 
    parameters._hideDialog = function()
    {
        dialogoverlay.style.display = "none";
	dialogbox.style.display     = "none";
	document.getElementById('dialogboxbody').innerHTML = '';
	document.getElementById('dialogboxfoot').innerHTML = '';
    };	

    // Bind the parameters class to the osweb namespace.
    osweb.parameters = parameters;
}());

/*
 * Definition of the class session.
 */

(function() 
{
    function parser() 
    {
	throw "The class parser cannot be instantiated!";
    }

    // Definition of private properties.
    parser._ast_tree      = null;    
    parser._current_node  = null;
    parser._inline_script = null;
    parser._status        = 0;                      
                
    /*
     * Definition of private methods.   
     */

    parser._prepare = function(pScript)
    {
        if (pScript !== '')
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
     * Definition of private methods - node types
     */

    parser._set_return_value = function(pNode, pValue)
    {
        var index=0;
        while (typeof pNode['returnvalue' + String(index)] !== 'undefined')
        {
            index++;
        }    
        
        // Set the return value\
        pNode['returnvalue' + String(index)] = pValue;
    };
    
    /*
     * Definition of private methods - node types
     */
    
    parser._node_binary_expression = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // process right expression;
                this._current_node.status = 1;
                this._current_node.right.parent = this._current_node;
                this._current_node = this._current_node.right;

                // Return to the node processessor.
                this._process_node();
            break;        
            case 1: 
                // process right expression;
                this._current_node.status = 2;
                this._current_node.left.parent = this._current_node;
                this._current_node = this._current_node.left;

                // Return to the node processessor.
                this._process_node();
            break;        
            case 2: 
                var left,right;
                if  (typeof window[this._current_node.returnvalue0] === 'undefined')
                {
                    var right = this._current_node.returnvalue0;
                }
                else
                {
                    var right = window[this._current_node.returnvalue0];
                }
                var left,right;
                if  (typeof window[this._current_node.returnvalue1] === 'undefined')
                {
                    var left = this._current_node.returnvalue1;
                }
                else
                {
                    var left = window[this._current_node.returnvalue1];
                }
            
                // Select the binary operator to perform.
                switch (this._current_node.operator)
                {
                    case '-':
                        // Process call - check for blocking methods.
    
                        this._set_return_value(this._current_node.parent,left - right);
                    break;
                }

                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;        
        }    
    };    

    parser._node_call_expression = function()
    {
        // Initialize status property.
        this._current_node.arguments = (typeof this._current_node.arguments === 'undefined') ? [] : this._current_node.arguments;
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0  : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Process arguments.
                if (this._current_node.index < this._current_node.arguments.length)		
                {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.arguments[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.arguments[this._current_node.index - 1];
        
                    // Return to the node processessor.
                    this._process_node();
                } 
                else
                { 
                    // Set parent node.
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
            break;
            case 1: 
                // Set parent node.
                this._current_node.status = 2;
                this._current_node.callee.parent = this._current_node;
                this._current_node = this._current_node.callee;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set status of node.
                this._current_node.status = 3;
            
                // Create the aruments array.
                var tmp_arguments = [];
                for (var i=0;i< this._current_node.arguments.length; i++)
                {
                    if (typeof window[this._current_node['returnvalue' + String(i)]] !== 'undefined')
                    {
                        tmp_arguments.push(window[this._current_node['returnvalue' + String(i)]]);
                    }    
                    else
                    {    
                        tmp_arguments.push(this._current_node['returnvalue' + String(i)]);
                    }    
                }    
                    
                // Select the type of call to process
                var callee = this._current_node['returnvalue' + String(this._current_node.arguments.length)];
                var returnvalue = null;
                if (callee.type == 'function')
                {
                    // function call
                    returnvalue = window[callee.obj].apply(null, tmp_arguments);
                    
                    // Process call - check for blocking methods.
                    this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
                else if (callee.type == 'object')
                {
                    if ((callee.obj == 'clock') && (callee.prop == 'sleep'))
                    {
                        // Process special calls with blocking (no direct result processing).
                        window[callee.obj][callee.prop].apply(window[callee.obj], tmp_arguments);
                    }    
                    else
                    {    
                        // object methods calls.
                        returnvalue = window[callee.obj][callee.prop]();
                    
                        // Process call - check for blocking methods.
                        this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                        // Return to the node processessor.
                        this._process_node();
                    }        
                }
                else
                {
                    console.log('---');
                    switch (callee)
                    {   
                        case 'canvas':
                            returnvalue = new osweb.canvas();
                        break;    
                    }    
                    console.log(returnvalue);
                    
                    // Process call - check for blocking methods.
                    this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
            break;    
            case 3: 
                // Set parent node.
                this._current_node.status = 4;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;        
        }    
    };

    parser._node_expression_statement = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0  : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Set parent node.
                this._current_node.status = 1;
                this._current_node.expression.parent = this._current_node;
                this._current_node = this._current_node.expression;

                // Return to the node processessor.
                 this._process_node();
            break;
            case 1: 
                // Set parent node.
                this._current_node.status = 2;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        ;}    
    };

    parser._node_identifier = function()
    {
        // Return function result.
        if (typeof window[this._current_node.name] === 'undefined')
        {
            // Item is undefined, create it without value/type definition.
            window[this._current_node.name] = null;
        }
        
        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.name);

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_literal = function()
    {
        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.value);
        
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_member_expression = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Process object.
                this._current_node.status = 1;
                this._current_node.object.parent = this._current_node;
                this._current_node = this._current_node.object;
                
                // Return to the node processessor.
                this._process_node();
            break;    
            case 1: 
                // Process object.
                this._current_node.status = 2;
                this._current_node.property.parent = this._current_node;
                this._current_node = this._current_node.property;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set the return value.
                //console.log('member->');
                //console.log(typeof this._current_node.returnvalue0);
                    
                if (typeof this._current_node.returnvalue0 == 'object')
                {
                    this._set_return_value(this._current_node.parent,{ 'obj': this._current_node.returnvalue1, 'prop': null, 'type': 'function'});
                }
                else
                {    
                    this._set_return_value(this._current_node.parent,{ 'obj': this._current_node.returnvalue0, 'prop': this._current_node.returnvalue1,'type':'object'});
                }
                
                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;    
        }        
    };

    parser._node_program = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.body.length)		
            	{
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.body[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.body[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                }
                else
                {
                    // End status.
                    this._current_node.status = 1;
                
                    // Return to the node processessor.
                    this._process_node();
                }    
            break;
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // All nodes are processed, set status to finished.
                this._status = 2;
        
                // Complete the inline item.    
                if (this._inline_script != null)
                {    
                    this._inline_script.complete();
                }    
            break;    
        }   
    };    

    parser._node_variable_declaration = function()
    {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index; 
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.declarations.length)		
        	{
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.declarations[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.declarations[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } 
                else
                {
                    // Change the node stats.                                
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }    
            break; 
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // Set parent node.
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        }   
    };

    parser._node_variable_declarator = function()
    {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status; 
        
        // Process the current status.
        switch (this._current_node.status)
        {
            case 0: 
                // Process init.
                this._current_node.status      = 1;
                this._current_node.init.parent = this._current_node;
                this._current_node             = this._current_node.init;
                
                // Return to the node processessor.
                this._process_node();
            break;    
            case 1: 
                // process id.
                this._current_node.status    = 2;
                this._current_node.id.parent = this._current_node;
                this._current_node           = this._current_node.id;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2: 
                // Set variable.
                window[this._current_node.returnvalue1] = this._current_node.returnvalue0;      
                
                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;    
        }
    };

    /*
     * Definition of private methods - process node
     */

    parser._process_node = function()
    {
        console.log('processing node');
        console.log(this._current_node);
        
        // Select the type of node to process
        switch(this._current_node.type)
        { 
            case 'BinaryExpression':
                this._node_binary_expression();
            break;
            case 'CallExpression':
                this._node_call_expression();
            break;
            case 'ExpressionStatement':
                this._node_expression_statement();
            break;
            case 'Identifier':
                this._node_identifier();
            break;
            case 'Literal':
                this._node_literal();
            break;
            case 'MemberExpression':
                this._node_member_expression();
            break;
            case 'Program':
                this._node_program();
            break;
            case 'VariableDeclaration':
                this._node_variable_declaration();
            break; 
            case 'VariableDeclarator':
                this._node_variable_declarator();
            break; 
        }
    };

    /*
     * Definition of private methods - statements
     */

    parser._runstatement = function(pNode)
    {
        // Call the expression statement en return the value.       
        return this._node_call_expression(pNode.expression);
    };
    
    parser._run = function(pInline_script, pAst_tree)
    {
        // Set the inline item. 
	this._inline_script = pInline_script;
	
	// Set the first node and its parent.
	this._current_node        = pAst_tree;
        this._current_node.parent = null;
        this._status              = 1;
        
    	// Process the nodes. 
	osweb.parser._process_node();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}()); 

/*
 * Definition of the class session.
 */

(function() 
{
    function session() 
    {
    	throw "The class session cannot be instantiated!";
    }

    /*
     * Definition of session related methods.   
     */

    session._initialize = function()
    {
    	// Update the loader text.
    	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_008);
	
    	// Get the session information.
	this._getSessionInformation();
    };

    /*
     * Definition of session related methods.   
     */

    session._getSessionInformation = function()
    {
    	// Get the session information from the client system
    	this.date    = new Date();
	this.session = 
        {
            "browser": 
            {
                "codename"        : navigator.appCodeName,
                "name"            : navigator.appName,
                "version"         : navigator.appVersion
            },
            "date": 
            {
                "startdate"       : ('0' + this.date.getDate()).slice(-2) + '-' + ('0' + this.date.getMonth()).slice(-2) + '-' + ('0' + this.date.getFullYear()).slice(-2),
                "starttime"       : ('0' + this.date.getHours()).slice(-2) + ':' + ('0' + this.date.getMinutes()).slice(-2) + ':' + ('0' + this.date.getSeconds()).slice(-2),
                "startdateUTC"    : ('0' + this.date.getUTCDate()).slice(-2) + '-' + ('0' + this.date.getUTCMonth()).slice(-2) + '-' + ('0' + this.date.getUTCFullYear()).slice(-2)
            },
            "experiment": 
            {
		"debug"		  : 0,
                "parameters"	  : 0,
		"pilot"           : 0,
                "taskname"        : 0,
                "taskversion"     : 0
            },
            "screen":
            {
                "availableHeight" : screen.availHeight,
                "availableWidth"  : screen.availWidth,
                "colorDepth"      : screen.colorDepth,
                "height"          : screen.height,
                "outerheight"     : window.outerheight,
                "outerwidth"      : window.outerwidth,
                "pixelDepth"      : screen.pixelDepth,
                "screenX"         : window.screenX,
                "screenY"         : window.screenY,
                "width"           : screen.width
            },
            "system": 
            {
                "os"              : navigator.platform
            }
        };
    };

    // Bind the session class to the osweb namespace.
    osweb.session = session;
}()); 

/*
 * Definition of the class runner.
 */

(function() 
{
    function runner() 
    {
    	throw "The class runner cannot be instantiated!";
    };

    // Show library name and library version number in the console.
    console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);	
    console.log(osweb);

    // Definition of private properties.
    runner._canvas        = null;           // Canvas on which the experiment is shown.
    runner._qualtrics     = null;           // Link to the qualtrics interface (optional)
    runner._stage	  = null;           // Links to the stage object (CreateJS).

    // Definition of public properties.
    runner.debug          = false;          // Debug toggle.
    runner.experiment     = null;           // The root experiment object to run.           
    runner.onFinished	  = null;           // Event triggered on finishing the experiment.
    runner.screenIntro    = true;           // Show introscreen toggle.
    runner.screenClick    = true;           // Show clickscreen toggle
    runner.script         = null;           // Container for the JSON script definition of the experiment.
    runner.scriptID       = 0;              // Id used when retrieving the script from the database.
    runner.scriptURL      = '';             // Path pointing to the AMFPHP database files.
    runner.session	  = null;           // Container for the JSON session information.
    
    /*
     * Definition of the private setup methods.      
     */

    runner._setupContent = function(pContent)
    {
    	// Check if the experiment container is defined.                     
	if (typeof pContent !== "undefined") 
	{
            // Get the canvas from the DOM Element tree.
            this._canvas = (typeof pContent === 'string') ? document.getElementById(pContent) : pContent; 		
		
            // Set the stage object (easelJS). 
            this._stage                    = new createjs.Stage(this._canvas);
            this._stage.snapToPixelEnabled = true;
            this._stage.regX               = -.5;
            this._stage.regY 		   = -.5;
		
            // Build the initialization screen.
            this._setupIntroScreen();
	}
	else
	{
            osweb.debug.addError(osweb.constants.ERROR_002);
	}
    };

    runner._setupContext = function(pContext)
    {
	// Check if the script parameter is defined.                        
	if (typeof pContext !== "undefined") 
	{
            // Set the context container.
            this._context = pContext;
			
            // Initialize the context parameters.
            this.debug        = (typeof this._context.debug       !== 'undefined') ? this._context.debug       : false; 
            this.file         = (typeof this._context.file        !== 'undefined') ? this._context.file        : null;
            this.onFinished   = (typeof this._context.onFinished  !== 'undefined') ? this._context.onFinished  : null;
            this.screenClick  = (typeof this._context.screenClick !== 'undefined') ? this._context.screenClick : true;				      
            this.screenIntro  = (typeof this._context.screenIntro !== 'undefined') ? this._context.screenIntro : true; 
            this.script       = (typeof this._context.script      !== 'undefined') ? this._context.script      : null;      
            this.scriptID     = (typeof this._context.scriptID    !== 'undefined') ? this._context.scriptID    : 0;         
            this.scriptURL    = (typeof this._context.scriptURL   !== 'undefined') ? this._context.scriptURL   : '';		 
            this.session      = (typeof this._context.session     !== 'undefined') ? this._context.session     : null;
					
            // Check if an osexp script is given as parameter.                            
            if (this.script !== null) 
            {	
                // Start building the experiment structure.      
		this._buildExperiment();
            }
            // Check if an osexp file is given as parameter. 
            else if (this.file !== null)
            {
                this._setupScriptFromFile();
            }	
            else
            {
                // Retrieve the script from an external location.
		this._setupScriptFromDatabase();
            }
	}
	else
	{
            osweb.debug.addError(osweb.constants.ERROR_003);
	}
    };

    runner._setupScriptFromFile = function()
    {
        // Check for binary or text file definition.
        if (this.file.substring(0,3) == '---')
        {
            this.script = String(this.file);
        } 
        else
        {
            // Decompress the gizp file and splitt the tar result.	
            GZip.loadlocal(this.file, function(h) 
            {
                var tar = new TarGZ;
                tar.parseTar(h.data.join(''));
                tar.files.forEach(this.setupScriptFromFileResult.bind(this)); 
            }.bind(this), this.setupScriptFromFileProgress, this.setupScriptFromFileAlert);
        }    
        
        // Start building the experiment structure.      
	this._buildExperiment();
    };

    runner.setupScriptFromFileAlert = function()
    {
    };

    runner.setupScriptFromFileProgress = function()
    {
    };

    runner.setupScriptFromFileResult = function(pFile)
    {
	// Check if the file is the scriptfile.
    	if (pFile.filename === 'script.opensesame') 
	{
            // Create the script.
            this.script = String(pFile.data);
   	}
	else if ((pFile.data !== null) && (pFile.data !== ''))
	{
            // Create a file pool element.
            osweb.pool.add_from_local_source(pFile);			
	}
    };

    runner._setupScriptFromDatabase = function()
    {
	// Check if the URL and ID is propertly defined.
       	if ((this.scriptID >= 0) && (this.scriptURL !== ''))
       	{
            var url        = this.scriptURL + '/php/index.php?/ajax/group/get_status';
            var parameters = {group_id: 99, task_number: this.scriptID};
		
            new Ajax.Request(url,
            {
            	parameters: parameters,
		onCreate: function(response) 
		{
                    var t = response.transport;
                    t.setRequestHeader = t.setRequestHeader.wrap(function(original, k, v) 
                    {
			if (/^(accept|accept-language|content-language)$/i.test(k))
                            return original(k, v);
			if (/^content-type$/i.test(k) &&
                            /^(application\/x-www-form-urlencoded|multipart\/form-data|text\/plain)(;.+)?$/i.test(v))
                            return original(k, v);
			return;
                    });
		},
		onSuccess: function(transport) 
		{
                    // Process the response
                    if (transport.responseText)
                    {
                        // Retrieve the response text.
			var jsonresponse = JSON.parse(transport.responseText);
					
			// Check if the task is available.
			if (jsonresponse.task_available === '1') 
			{
                            // Set the script parameter.
                            this.script = jsonresponse.data_available;
                            this.files  = jsonresponse.file_available.split('\r\n');    
                                    
                            // Create a file pool element.
                            osweb.pool.add_from_server_source(this.scriptURL + '/user/4/', this.files);			
                        }
			else
			{
                            // Show erorr message within the concole.
                            osweb.debug.addError(osweb.constants.ERROR_007);
			}
                    }	
                    else
                    {
			// Show erorr message within the concole.
			osweb.debug.addError(osweb.constants.ERROR_006);
                    }
		}.bind(this),
		onFailure: function()
		{
                    // Show erorr message within the concole.
                    osweb.debug.addError(osweb.constants.ERROR_005);
		}.bind(this) 
            }); 
	}
	else
	{
            // Show erorr message within the concole.
            osweb.debug.addError(osweb.constants.ERROR_004);
	} 
    };

    /*
     * Definition of the private introscreen methods.      
     */

    runner._setupIntroScreen =  function() 
    {
    	// Set the introscreen elements.
	if (this.screenIntro === true)
	{
            this._introScreen  = new createjs.Shape();
            this._introScreen.graphics.beginFill('#000000').drawRect(0,0,this._stage.width,this._stage.height);
            this._introLine    = new createjs.Shape();
            this._introLine.graphics.beginFill('#AAAAAA').drawRect(200,155,400,1);
            this._introText1   = new createjs.Text('OS', "24px bold Times", "#FF0000");
            this._introText1.x = 200;
            this._introText1.y = 135;
            this._introText2   = new createjs.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, "14px Arial", "#FFFFFF");
            this._introText2.x = 231;
            this._introText2.y = 142;
            this._introText3   = new createjs.Text(osweb.constants.MESSAGE_003,"12px Arial", "#FFFFFF");
            this._introText3.x = 200;
            this._introText3.y = 168;
            this._stage.addChild(this._introScreen,this._introLine,this._introText1,this._introText2,this._introText3);
            this._stage.update();
	}
    };
	
    runner._clearIntroScreen = function()
    {
        // Update the introscreen elements.
	if (this.screenIntro === true)
	{
            this._stage.removeChild(this._introScreen,this._introLine,this._introText1,this._introText2,this._introText3);
            this._stage.update();
	}		
    };
	
    runner._updateIntroScreen = function(pText)
    {
	// Update the introscreen elements.
	if (this.screenIntro === true)
	{
            this._introText3.text = pText;
            this._stage.update();
	}		
    };

    /*
     * Definition of the private build methods.      
     */

    runner._buildExperiment = function()
    {
    	// Build the base experiment object.
	this.experiment = new osweb.experiment(null, 'test', this.script);
	
        // Create the global static object classes.
	window['items'] = osweb.item_store;
	window['pool']  = osweb.file_pole_store;
	window['vars']  = this.experiment.vars;
		
	// Create the global dynamic object classes.
	window['keyboard'] = osweb.keyboard_backend;

	// Pepare the experiment to run.
	this._prepare();
    };

    /*
     * Definition of private methods (prepare cycle).   
     */

    runner._prepare = function()
    {
	// Update inroscreen.
	this._updateIntroScreen(osweb.constants.MESSAGE_004);
		
	// Start the stimuli loader.
	osweb.parameters._initialize();
        osweb.functions._initialize();
	osweb.session._initialize();

        // Start the experiment.
        this._prepareParameters();
    };

    runner._prepareParameters = function()
    {
        // Update inroscreen.
	this._updateIntroScreen(osweb.constants.MESSAGE_005);

	// Check if items must be processed. 
	if (osweb.parameters._parameters.length > 0)
	{
		// Process the Parameters.        
   	    osweb.parameters._processParameters();
	}
	else
	{ 
            // Start the experiment.
   	    this._prepareStartScreen();
	}
    };

    runner._prepareStartScreen = function()
    {
        // Check if the experiment must be clicked to start.
        if (this.screenClick === true)
	{
            // Update inroscreen.
            this._updateIntroScreen(osweb.constants.MESSAGE_006);
		
            // Setup the mouse click response handler.
            var clickHandler = function(event)
            {
		// Remove the handler.
		this._canvas.removeEventListener("click",clickHandler);

		// Finalize the introscreen elements.
		this._clearIntroScreen();

                // Start the task.
		this._initialize();
            }.bind(this); 

            // Set the temporary mouse click.
            this._canvas.addEventListener("click", clickHandler,false);
	}
	else
	{
            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the runner.
            this._initialize(); 
	}
    };

    /*
     * Definition of private methods (run cycle).   
     */

    runner._initialize = function()
    {
	// Initialize the debugger. 
	osweb.debug._initialize();

        // Initialize the devices.
	osweb.events._initialize();

        // Prepare and execute the experiment item.
	this.experiment.prepare();
	this.experiment.run();
    };
	
    runner._finalize = function()
    {   
        // Finalize the devices.
    	osweb.events._finalize();
        
    	// Finalize the debugger. 
	osweb.debug._finalize();
        	
        // Set the cursor visibility to none (default).
        this._stage.canvas.style.cursor = "default";

        // Check if an event handler is attached.
	if (this.onFinished) 
	{
            // Execute.
            this.onFinished();
	}
    };

    /*
     * Definition of the public run methods.      
     */

    runner.run = function(pContent, pContext) 
    {
        // Initialize the content container.
	this._setupContent(pContent);

	// Initialize the context parameter
	this._setupContext(pContext);
    };

    // Bind the runner class to the osweb namespace.
    osweb.runner = runner;
}()); 
