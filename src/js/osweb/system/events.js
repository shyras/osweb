
module.exports = function(osweb){
    "use strict";
    // Class events - processing all user and system evens within osweb.
    function events() {
        throw 'The class events cannot be instantiated!';
    };

    // Definition of private properties.
    events._active = false; // If true event processing is active.
    events._break = false; // If true the experiment is forced to stop.
    events._caller = null; // The caller object (clock, keyboard, mouse).
    events._current_item = null; // Contain the current active item. 			
    events._keyboard_mode = osweb.constants.PRESSES_ONLY; // Keyboard collecting mode (down/up/both).
    events._keyboard_event = null; // Contains the last known keyboard event.
    events._mouse_mode = osweb.constants.PRESSES_ONLY; // Mouse collecting mode (down/up/both).
    events._mouse_move = null; // Contains the last known mouse move event (used within the mouse class).
    events._mouse_press = null; // Contains the last known mouse press event (used within the mouse class).	
    events._response_given = false; // Valid response toggle
    events._response_type = -1; // Set type of response (0 = none, 1 = keyboard, 2 = mouse, 3 = sound). 
    events._response_list = null; // Items to respond on.
    events._sound_ended = false; // Sound play is finished.
    events._timeout = -1; // Duration for timeout.
    events._video_ended = false; // Video play is finished.

    // Definition of the conversion table to convert keycodes to OpenSesame codes.
    events.KEY_CODES = ['', '', '', '', '', '', 'help', '', 'backspace', 'tab', '', '', 'clear', 'enter', 'enter_special', '', 'shift', 'ctrl', 'alt', 'pause', // 00  .. 19
        'caps', '', '', '', '', '', '', 'escape', '', '', '', '', 'space', 'page up', 'page down', 'end', 'home', 'left', 'up', 'right', // 20  .. 39
        'down', 'select', 'print', 'execute', 'print screen', 'insert', 'delete', '', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', // 40  .. 59
        '<', '=', '>', '?', '@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // 60  .. 79
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'left meta', 'right meta', 'menu', '', '', 'kp0', 'kp1', 'kp2', 'kp3', // 80  .. 99
        'kp4', 'kp5', 'kp6', 'kp7', 'kp8', 'kp9', 'kp_multiply', 'kp_plus', '', 'kp_minus', 'kp_period', 'kp_divide', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', // 100 .. 119
        'f9', 'f10', 'f11', 'f12', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 120 .. 139
        '', '', '', '', 'numlock', 'scrollock', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 140 .. 159
        '^', '!', '"', '#', '$', '%', '&', '_', '(', ')', '*', '+', '|', '_', '{', '}', '~', '', '', '', // 160 .. 179
        '', '', '', '', '', '', ';', '=', ',', '-', '.', '/', '`', '', '', '', '', '', '', '', // 180 .. 199
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '[', // 200 .. 219
        '\\', ']', '\'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 220 .. 239
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]; // 240 .. 255
    // Definition of the conversion table to convert shift keycodes to OpenSesame codes.
    events.KEY_SCODES = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pause', // 00  .. 19
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 20  .. 39
        '', '', '', '', '', '', '', '', ')', '!', '@', '#', '$', '%', '^', '&', '*', '(', '', ':', // 40  .. 59
        '', '+', '', '', '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // 60  .. 79
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', '', '', '', '', '', '', '', '', '', '', // 80  .. 99
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 100 .. 119
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 120 .. 139
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 140 .. 159
        '', '', '', '', '', '', '', '', '', '', '', '', '', '_', '', '', '', '', '', '', // 160 .. 179
        '', '', '', '', '', '', '', '', '<', '', '>', '?', '~', '', '', '', '', '', '', '', // 180 .. 199
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '{', // 200 .. 219
        '|', '}', '"', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 220 .. 239
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]; // 240 .. 255

    // Definition of methods for general event processing.    

    events._initialize = function() {
        // Initialize the keyboard event listeners.
        window.addEventListener("keydown", this._keyDown.bind(this), false);
        window.addEventListener("keyup", this._keyUp.bind(this), false);

        // Initialize the mouse event listeners.
        osweb.runner._canvas.addEventListener("mousedown", this._mouseDown.bind(this), false);
        osweb.runner._canvas.addEventListener("mousemove", this._mouseMove.bind(this), false);
        osweb.runner._canvas.addEventListener("mouseup", this._mouseUp.bind(this), false);

        // Initialize the mouse context event listeners.
        osweb.runner._canvas.addEventListener("contextmenu", this._mouseContext.bind(this), false);

        // Initialize the tick event listener.
        createjs.Ticker.setInterval(15);
        createjs.Ticker.addEventListener("tick", this._tick.bind(this));
    };

    events._finalize = function() {
        // Finalize the tick event listener.             
        createjs.Ticker.removeEventListener("tick");

        // Finalize the mouse context event listeners.
        osweb.runner._canvas.removeEventListener("contextmenu", this._mouseContext, false);

        // Finalize the mouse event listeners.
        osweb.runner._canvas.removeEventListener("mousedown", this._mouseDown, false);
        osweb.runner._canvas.removeEventListener("mousemove", this._mouseMove, false);
        osweb.runner._canvas.removeEventListener("mouseup", this._mouseUp, false);

        // Finalize the keyboard event listeners.
        window.removeEventListener("keydown", this._keyDown, false);
        window.removeEventListener("keyup", this._keyUp, false);
    };

    events._run = function(caller, timeout, response_type, response_list) {
        // Set the event running properties.     
        this._caller = caller;
        this._response_list = response_list;
        this._response_type = response_type;
        this._timeout = timeout;

        // Activate the event running.  
        this._response_given = false;
        this._sound_ended = false;
        this._video_ended = false;
        this._active = true;
    };

    events._update = function() {
        // Check if the duration is finished.
        if (((this._timeout === -1) && ((this._response_given === true) || (this._sound_ended === true) || (this._video_ended === true))) ||
            ((this._timeout > 0) && ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) || (this._response_type === osweb.constants.RESPONSE_MOUSE)) && (this._response_given === true)) ||
            (((this._timeout > 0) && (this._current_item.clock.time() - this._current_item.experiment.vars.get('time_' + this._current_item.name)) > this._timeout))) {
            // Set the status of the current item to finalize.
            this._current_item._status = osweb.constants.STATUS_FINALIZE;
        } else {
            // Update the current item.
            this._current_item.update();
        }
    };

    events._complete = function() {
        // Disable the ticker
        this._active = false;

        // Remove the items from the general stack.
        osweb.item_stack.pop();

        // Execute the post-run phase after duration is finished or response is received.
        this._current_item.complete();
    };

    // Definition of methods for keyboard event processing.

    events._convertKeyCode = function(event) {
        // Check for special characters
        var key = '';
        if ((event.shiftKey === true) && (event.keyCode !== 16)) {
            // Shift key pressed with other key, so convert shift keys.
            key = this.KEY_SCODES[event.keyCode];
        } else if ((event.shiftKey === true) && (event.keyCode === 16)) {
            // Shift code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lshift' : 'rshift';
        } else if ((event.ctrlKey === true) && (event.keyCode === 17)) {
            // Ctrl code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lctrl' : 'rctrl';
        } else if ((event.altKey === true) && (event.keyCode === 18)) {
            // Alt code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lalt' : 'ralt';
        } else {
            // Convert standard keycode.
            key = this.KEY_CODES[event.keyCode];
        }

        // Return function result.
        return key;
    };

    events._keyDown = function(event) {
        // Store the keyboard event.    
        this.keyboard_event = event;

        // Only select this event when the collection mode is set for this.
        if ((this._keyboard_mode === osweb.constants.PRESSES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processKeyboardEvent(event, 1);
        }
    };

    events._keyUp = function(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._keyboard_mode === osweb.constants.RELEASES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processKeyboardEvent(event, 0);
        }
    };

    events._processKeyboardEvent = function(event, keyboard_state) {
        // Create a new keyboard response object.
        var KeyboardResponses = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time(),
            'state': keyboard_state,
            'type': osweb.constants.RESPONSE_KEYBOARD
        };

        // Convert response to proper keyboard token. 
        KeyboardResponses.resp = this._convertKeyCode(event);

        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) && ((this._response_list === null) || (this._response_list.indexOf(KeyboardResponses.resp) >= 0))) {
            // Process the current item.
            if (this._current_item !== null) {
                // Process the response.
                this._current_item.update_response(KeyboardResponses);
            }

            // Set the valid response given toggle.
            this._response_given = true;
        }
    };

    // Definition of methods for mouse event processing.

    events._mouseContext = function(event) {
        // Prevent default action. 
        event.preventDefault();

        // Return false to prevent the context menu from pushing up.
        return false;
    };

    events._mouseDown = function(event) {
        // Store the mouse press status for use in the mousee class.
        this._mouse_press = event;

        // Only select this event when the collection mode is set for this.
        if ((this._mouse_mode === osweb.constants.PRESSES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processMouseEvent(event, 1);
        }
    };

    events._mouseMove = function(event) {
        // Store the mouse move event and its timestamp for use in the mouse class.
        this._mouse_move = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time()
        };
    };

    events._mouseUp = function(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._mouse_mode === osweb.constants.RELEASES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processMouseEvent(event, 0);
        }
    };

    events._processMouseEvent = function(event, mouse_state) {
        // Create a new mouse response object.
        var MouseResponses = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time(),
            'state': mouse_state,
            'type': osweb.constants.RESPONSE_MOUSE
        };

        // Adjust mouse response.  
        MouseResponses.resp = String(event.button + 1);

        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_MOUSE) && ((this._response_list === null) || (this._response_list.indexOf(MouseResponses.resp) >= 0))) {
            // Process the response to the current object.
            if (this._current_item !== null) {
                this._current_item.update_response(MouseResponses);
            }

            // Set the valid response given toggle.
            this._response_given = true;
        }
    };

    // Definition of methods for sound event processing.

    events._audioEnded = function(event) {
        // If duration isequal to sound exit the sound item.
        var sampler = this;
        if(sampler.duration == "sound"){
            osweb.events._sound_ended = true;
        }
    };

    // Definition of methods for video event processing.

    events._videoEnded = function() {
        osweb.events._video_ended = true;
    };

    events._videoPlay = function(event) {};

    // Definition of methods for tick event processing (timing).

    events._tick = function(event) {
        // Check if the exit flag is set
        if (this._break === true)
        {
            // Prevent firing double.
            this._break = false;
            
            // Disable the ticker.
            this._active = false;
            
            // End the experiment
            osweb.runner.experiment.end();
        }
        else if ((this._current_item !== null) && (this._active === true)) {
            // Only check for status if there is a current item and the ticker is activated.
            switch (this._current_item._status) {
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
    return events;
}