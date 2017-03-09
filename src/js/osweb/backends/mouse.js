/** Class representing a mouse device. */
osweb.mouse = class Mouse {
    /**
     * Create an object which represents a mouse device.
     * @param {Object} experiment - The experiment to which the logger belongs.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} buttonList - List of acceptable response buttons.
     * @param {Boolean} visible - Toggle for showing the mouse cursor.
     */
    constructor(experiment, timeOut, buttonList, visible) {
        // Create and set public properties. 
        this.experiment = experiment; // Anchor to the experiment object.
        this.timeout = (typeof timeout === 'undefined') ? null : timeout; // Duration in millisecond for time-out. 
        this.buttonlist = (typeof buttonlist === 'undefined') ? null : buttonlist; // List of acceptable response buttons.	
        this.visible = (typeof visible === 'undefined') ? false : visible; // if true the mouse cursor is visible.
    
        // Set constant properties.
        this.SYNONIEM_MAP = [
            ['1', 'left_button'],
            ['2', 'middle_button'],
            ['3', 'right_button'],
            ['4', 'scroll_up'],
            ['5', 'scroll_down']
        ];
    }

    /**
     * Convert all response values to their default values (remove synoniems).
     * @param {Array} responses - A list of response values.
     * @return {Array} - List of default values for the given responses.
     */
    _get_default_from_synoniem(responses) {
        // Return the default synoniem value from a response.
        var defaults = [];
        for (var i = 0; i < responses.length; i++) {
            var synoniem = this.synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;
    }

    /**
     * Returns the dedault configuration for the mouse backend.
     * @return {Object} - JSON object width the default values.
     */
    default_config() {
        // Return the default configuration.
        return {
            'timeout': null,
            'buttonlist': null,
            'visible': false
        };
    }

    /** Clear all pending keyboard input, not limited to the keyboard. */
    flush() {
    };

    /**
     * Collects a single mouse click.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} buttonList - List of acceptable response buttons.
     * @param {Boolean} visible - Toggle for showing the mouse cursor.
     */
    get_click(timeout, buttonlist, visible) {
        // Collects a single mouse click.
        this.timeout = (typeof timeout === 'undefined') ? this.timeout : timeout;
        this.buttonlist = (typeof buttonlist === 'undefined') ? this.buttonlist : buttonlist;
        this.visible = (typeof visible === 'undefined') ? this.visible : visible;

        if (this.experiment != null) {
            // Hide or show the mouse.
            this.show_cursor(this.visible);

            // Set the event processor.
            this.experiment._runner._events._run(this.timeout, osweb.constants.RESPONSE_MOUSE, this.buttonlist);
        };
    }

    /**
     *  Returns the current mouse position. !Warning: this methods uses the state in
     *  the last known mouse move, not the current state.
     *  @param {Object} - Object with time, x and y coordinate of the mouse cursor.
     */
    get_pos() {
        // Returns the current mouse position. !Warning: this methods uses the state in the last known mouse respone, not the current state.
        if (this.experiment._runner._events._mouseMoveEvent !== null) {
            return {
                'rtTime': this.experiment._runner._events._mouseMoveEvent.rtTime,
                'x': this.experiment._runner._events._mouseMoveEvent.event.clientX,
                'y': this.experiment._runner._events._mouseMoveEvent.event.clientY
            };
        } else {
            return {
                'rtTime': -1,
                'x': -1,
                'y': -1
            };
        }
    }

    /**
     *  Returns the current mouse position. !Warning: this methods uses the state in
     *  the last known mouse press, not the current state.
     *  @param {Object} - Object with the state of the mouse buttons.
     */
    get_pressed() {
        // Returns the current button state of the mouse buttons. !Warning: this methods uses the state in the last known mouse respone, not the current state.
        if (this.experiment._runner.events._mouse_press !== null) {
            return {
                'buttons': [(this.experiment._runner._events._mouseDownEvent.event.button === 0), 
                            (this.experiment._runner._events._mouseDownEvent.event.button === 1), 
                            (this.experiment._runner._events._mouseDownEvent.event.button === 2)]
            };
        } else {
            return {
                'buttons': [null, null, null]
            };
        }
    }

    /**
     * Set the configuration for the keyboard backend.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} keyList - List of acceptable response keys.
     */
    set_config(timeout, buttonlist, visible) {
        // Set mouse properties.          
        this.timeout = timeout;
        this.buttonlist = buttonlist;
        this.visible = visible;
    }

    /** Sets the current position of the cursor. */	
    set_pos(pos) {
    }

    /**
     * Shows or hides the mouse cursor.		
     * @param {Boolean} visible - If true the mouse cursor is shown.
     */
    show_cursor(visible) {
        // Set the property
        this.visible = visible;

        // Immediately changes the visibility of the mouse cursor.	
        if (visible === true) {
            // Show the mouse cursor.
            this.experiment._runner._renderer.view.style.cursor = 'default';
        } else {
            // Set the cursor visibility to none.
            this.experiment._runner._renderer.view.style.cursor = 'none';
        }
    }

    /**
     * Convert a response value to its default value (remove synoniem).
     * @param {String} button - A response.
     * @return {String} - Default value of the response.
     */
    synonyms(button) {
        if (typeof button !== 'undefined') {
            for (var i = 0; i < this.SYNONIEM_MAP.length; i++) {
                for (var j = 0; j < this.SYNONIEM_MAP[i].length; j++) {
                    if (this.SYNONIEM_MAP[i][j] == button) {
                        return this.SYNONIEM_MAP[i];
                        break;
                    }
                }
            }
        } else {
            return null;
        }
    }
} 
 