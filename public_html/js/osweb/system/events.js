
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
                this._current_item.update(KeyboardResponses);
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
                this._current_item.update(MouseResponses);
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
        console.log('video has ended');
        osweb.events._video_ended = true;
    };

    events._videoUpdate = function(event)
    {
        if (this._playing == true)
        {
            // Clip the content of the video to the 
            this._ctx.drawImage(this._video, 0, 0);
        
            // execute script.
            if (this._script !== null)
            {
                // Start the parser
                console.log(this._script);
                //osweb.parser._run(this, this._script);    		
            }    
        }    
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
