import { constants } from '../system/constants.js';

/** Class representing the event system. */
export default class Events {
    /** The events class controls the running of an experiment. */
    constructor(runner) {
        // Create and set private properties. 
        this._currentItem = null; // The current active item.
        this._keyDownEvent = null; // Container for last key event.
        this._keyDownHandler = null; // Key down event handler.
        this._keyPressMode = constants.PRESSES_ONLY; // Keyboard press mode. 
        this._keyUpHandler = null; // Key up event handler. 
        this._mouseDownEvent = null; // Container for last mouse event.
        this._mouseDownHandler = null; // Mouse down event handler.
        this._mouseMoveEvent = null; // Container for last mouse move event.
        this._mouseMoveHandler = null; // Mouse move event handler. 
        this._mousePressMode = constants.PRESSES_ONLY; // Mouse press mode.
        this._mouseUpHandler = null; // Mouse up event handler. 
        this._runner = runner; // Parent runner class.
        this._responseGiven = false; // Valid response toggle
        this._responseList = null; // Items to respond on.
        this._responseType = constants.RESPONSE_NONE; // Set type of response (0 = none, 1 = keyboard, 2 = mouse, 3 = sound). 
        this._soundHasEnded = false; // Sound play is finished.
        this._state = constants.TIMER_NONE; // Current status of the runner.  
        this._statePrevious = constants.TIMER_NONE; // Previous state, used when pausing experiment.
        this._timeHandler = null; // Timing event handler.
        this._timeOut = -1; // Duration before timeout occures. 
        this._timeStamp = -1; // Moment of update checking.
        this._videoHasEnded = false; // Video play is finished.

        // Definition of the conversion table to convert keycodes to OpenSesame codes.
        this._KEY_CODES = [
            '', '', '', '', '', '', 'help', '', 'backspace', 'tab', '', '', 'clear', 'enter', 'enter_special', '', 'shift', 'ctrl', 'alt', 'pause', // 00  .. 19
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
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' // 240 .. 255
        ];         

        // Definition of the conversion table to convert shift keycodes to OpenSesame codes.
        this._KEY_SHIFTCODES = [
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pause', // 00  .. 19
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
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' // 240 .. 255
        ]; 
    }    

    /** Initialize the event system. */
    _initialize() {
        // Create and set the keyboard event listeners.
        this._keyDownHandler = this._keyDown.bind(this);
        this._keyUpHandler = this._keyUp.bind(this);
        window.addEventListener('keydown', this._keyDownHandler)
        window.addEventListener('keyup', this._keyUpHandler)

        // Create and set the mouse event listeners.
        this._mouseDownHandler = this._mouseDown.bind(this);
        this._mouseMoveHandler = this._mouseMove.bind(this);
        this._mouseUpHandler = this._mouseUp.bind(this);
        this._runner._renderer.view.addEventListener('mousedown', this._mouseDownHandler)
        this._runner._renderer.view.addEventListener('mousemove', this._mouseMoveHandler)
        this._runner._renderer.view.addEventListener('mouseup', this._mouseUpHandler)

        // Set the current item to the experiment object.
        this._currentItem = this._runner._experiment;
        this._state = constants.TIMER_NONE;

        // Create the time handler and start the experiment.
        this._timeHandler = new PIXI.ticker.Ticker();
        this._timeHandler.add(this._time.bind(this));
        this._timeHandler.start();
    }

    /** Finalize the event system. */
    _finalize() {
        // Remove the keyboard event listeners.
        window.removeEventListener('keydown', this._keyDownHandler)
        window.removeEventListener('keyup', this._keyUpHandler)

        // Remove the mouse event listeners.
        this._runner._renderer.view.removeEventListener('mousedown', this._mouseDownHandler)
        this._runner._renderer.view.removeEventListener('mousemove', this._mouseMoveHandler)
        this._runner._renderer.view.removeEventListener('mouseup', this._mouseUpHandler)

        // Stop the timing event listener.
        this._timeHandler.stop();
        this._timeHandler.remove(this._time);

        // Clear the properties.
        this._currentItem = null;
        this._mouseDownEvent = null;
        this._mouseMoveEvent = null;
        this._responseList = null;
        this._timeHandler = null;
    }

    /**
     * Convert a keyboard code to a OpenSesame code (including special characters ctrl/shift/alt).
     * @param {Object} event - The keyboard event to process.
     * @return {String} - The converted keyboard code.
     */
    _convertKeyCode(event) {
        // Check for special characters
        var key = '';
        if ((event.shiftKey === true) && (event.keyCode !== 16)) {
            // Shift key pressed with other key, so convert shift keys.
            key = this._KEY_SHIFTCODES[event.keyCode];
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
            key = this._KEY_CODES[event.keyCode];
        }

        // Return function result.
        return key;
    }

    /**
     * Event handler for retrieving key down events.
     * @param {Object} event - system keydown event.
     */
    _keyDown(event) {
        // Store the keyboard event.    
        this._keyDownEvent = {
            'event': event,
            'rtTime': this._runner._experiment.clock.time()
        }; 

        // Check for esc key to pause the experiment.
        if ((event.keyCode === 27) && (this._state !== constants.TIMER_PAUSE)) {
            // Set system to paused.
            this._statePrevious = this._state;
            this._state = constants.TIMER_PAUSE;

            // Show the pause screen.
            this._runner._screen._showPauseScreen();
        } else if ((this._state === constants.TIMER_WAIT) && ((this._keyPressMode === constants.PRESSES_ONLY) || (this._keyPressMode === constants.PRESSES_AND_RELEASES))) {
            // Process the event.
            this._processKeyboardEvent(event, 1);
        } 
    }

    /**
     * Event handler for retrieving key up events.
     * @param {Object} event - system keyup event.
     */
    _keyUp(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._state === constants.TIMER_WAIT) && ((this._keyPressMode === constants.RELEASES_ONLY) || (this._keyPressMode === constants.PRESSES_AND_RELEASES))) {
            // Process the event.
            this._processKeyboardEvent(event, 0);
        }  
    }

    /**
     * Process and convert keyboard events into response objects.
     * @param {Object} event - system keyboard event.
     * @param {Number} keyboardState - type of keyboard event.
     */
    _processKeyboardEvent(event, keyboardState) {
        // Create a new keyboard response object.
        var keyboardResponse = {
            'event': event,
            'rtTime': this._runner._experiment.clock.time(),
            'state': keyboardState,
            'type': constants.RESPONSE_KEYBOARD
        };

        // Convert response to proper keyboard token. 
        keyboardResponse.resp = this._convertKeyCode(event);
  
        // Process the response to the current object.
        if ((this._responseType === constants.RESPONSE_KEYBOARD) && ((this._responseList === null) || (this._responseList.indexOf(keyboardResponse.resp) >= 0))) {
            // Process the current item.
            if (this._currentItem !== null) {
                // Process the response.
                this._currentItem._update(keyboardResponse);
            }

            // Set the valid response given toggle.
            this._responseGiven = true;
        }
    }

    /** Prevent the right mouse context menu from showing. */
    _mouseContext(event) {
        // Prevent default action. 
        event.preventDefault();

        // Return false to prevent the context menu from pushing up.
        return false;
    }

     /** Store the last mouse move event for later use. */
    _mouseMove(event) {
        // Store the mouse move event and its timestamp for use in the mouse class.
        this._mouseMoveEvent = {
            'event': event,
            'rtTime': this._runner._experiment.clock.time()
        }; 
    }

    /**
     * Event handler for retrieving mouse down events.
     * @param {Object} event - system mousedown event.
     */
    _mouseDown(event) {
        // Store the mouse down event and its timestamp for use in the mouse class.
        this._mouseDownEvent = {
            'event': event,
            'rtTime': this._runner._experiment.clock.time()
        }; 

        // Only select this event when the collection mode is set for this.
        if ((this._state === constants.TIMER_WAIT) && ((this._mousePressMode === constants.PRESSES_ONLY) || (this._mousePressMode === constants.PRESSES_AND_RELEASES))) {
            // Process the event.
            this._processMouseEvent(event, 1);
        }
    }

    /**
     * Event handler for retrieving mouse up events.
     * @param {Object} event - system mouseup event.
     */
    _mouseUp(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._state === constants.TIMER_WAIT) && ((this._mousePressMode === constants.RELEASES_ONLY) || (this._mousePressMode === constants.PRESSES_AND_RELEASES))) {
            // Process the event.
            this._processMouseEvent(event, 0);
        }
    }

    /**
     * Process and convert mouse events into response objects.
     * @param {Object} event - system mouse event.
     * @param {Number} mouseState - type of mouse event.
     */
    _processMouseEvent(event, mouseState) {
        // Create a mouse response object.
        var mouseResponse = {
            'event': event,
            'rtTime': this._runner._experiment.clock.time(),
            'state': mouseState,
            'type': constants.RESPONSE_MOUSE
        };

        // Adjust mouse response.  
        mouseResponse.resp = String(event.button + 1);

        // Process the response to the current object.
        if ((this._responseType === constants.RESPONSE_MOUSE) && ((this._responseList === null) || (this._responseList.indexOf(mouseResponse.resp) >= 0))) {
            // Process the response to the current object.
            if (this._currentItem !== null) {
                this._currentItem._update(mouseResponse);
            }
     
            // Set the valid response given toggle.
            this._responseGiven = true;
        }
    }

    /**
     * Event handler for sound event processing.
     * @param {Object} event - sound end event.
     */
    _audioEnded(event) {
        // If duration isequal to sound exit the sound item.
        var sampler = this;
        if (sampler.duration === "sound") {
            this._soundHasEnded = true;
        }
    }

    /** Definition of methods for video event processing. */
    _videoEnded(event) {
        // If duration is set to video end respons to this. 
        var video = this;
        if (video.duration === 'video') {
            video._experiment._runner._events._videoHasEnded = true;
        }
    }

    /** 
     * Event handler for video play processing.
     * @param {Object} event - sound end event. 
     */
    _videoPlay(event) {
    }

    /**
     * Event handler for experiment execution.
     * @param {Object} event - system timer event.
     */
    _time(event) {
        // Select the proper state.  
        switch (this._state) {
            case constants.TIMER_NONE:
                // Do nothing in the loop
            break;
            case constants.TIMER_WAIT:
                // Set current time stamp
                this._timeStamp = this._currentItem.clock.time();

                // Check if a time out occures or a valid response is given.
                if (((this._timeOut === -1) && ((this._responseGiven === true) || (this._soundHasEnded === true) || (this._videoHasEnded === true))) ||
                    ((this._timeOut > 0) && ((this._responseType === constants.RESPONSE_KEYBOARD) || (this._responseType === constants.RESPONSE_MOUSE)) && (this._responseGiven === true)) ||
                    ((this._timeOut > 0) && ((this._timeStamp - this._currentItem.experiment.vars.get('time_' + this._currentItem.name)) > this._timeOut))) {
                    // Adjus the status. 
                    this._state = constants.TIMER_NONE;
                
                    // Remove the items from the general stack.
                    this._runner._itemStack.pop();

                    // Execute the post-run phase after duration is finished or response is received.
                    this._currentItem._complete();
                } 
                else {
                    // Update the current item without response.
                    this._currentItem._update(null);
                }
            break;    
            case constants.TIMER_PAUSE:
                // Do nothing in the loop
            break;
            case constants.TIMER_RESUME:
                // Do nothing in the loop
            break;
            case constants.TIMER_BREAK:
                // Adjus the status. 
                this._state = constants.TIMER_NONE;

                // Exit the runner.
                this._runner._finalize(); 
            break;
            case constants.TIMER_EXIT:
                // Adjus the status. 
                this._state = constants.TIMER_NONE;

                // Exit the runner.
                this._runner._finalize(); 
            break;
            case constants.TIMER_FORM:
                // Update the current item without response.
                this._currentItem._update(null);
            break;    
        } 
    }

    /**
     * Execute a stimulus/response wait period for a certain item.
     * @param {Number} timeout - maximum time to wait for a response.
     * @param {Number} responseType - type of response to wait for.
     * @param {Array} responseList - list of acceptable respones.
     */
    _run(timeOut, responseType, responseList) {
        // Set the event run|ning properties.     
        this._responseList = responseList;
        this._responseType = responseType;
        this._timeOut = timeOut;

        // Activate the event running.  
        this._responseGiven = false;
        this._soundHasEnded = false;
        this._state = constants.TIMER_WAIT; 
        this._videoHasEnded = false;
    }
}
 