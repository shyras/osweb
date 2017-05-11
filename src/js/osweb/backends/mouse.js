import { constants } from '../system/constants.js';

/** Class representing a mouse device. */
export default class Mouse {
    /**
     * Create an object which represents a mouse device.
     * @param {Object} experiment - The experiment to which the logger belongs.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} buttonList - List of acceptable response buttons.
     * @param {Boolean} visible - Toggle for showing the mouse cursor.
     */
    constructor(experiment, timeOut, buttonList, visible) {
        // Create and set public properties. 
        this._experiment = experiment; 
        this._timeOut = (typeof timeOut === 'undefined') ? null : timeOut; 
        this._buttonList = (typeof buttonList === 'undefined') ? null : buttonList; 
        this._visible = (typeof visible === 'undefined') ? false : visible; 
        
        // Set constant properties.
        this._SYNONIEM_MAP = [
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
            var synoniem = this._synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;
    }

    /**
     * Set the configuration for the mouse backend.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} buttonList - List of acceptable response buttons.
     * @param {Boolean} visible - Toggle for showing the mouse cursor.
     */
    _set_config(timeOut, buttonList, visible) {
        // Set mouse properties.          
        this._timeOut = timeOut;
        this._buttonList = buttonList;
        this._visible = visible;
    }

    /**
     * Convert a response value to its default value (remove synoniem).
     * @param {String} button - A response.
     * @return {String|Null} - Default value of the response or null if none.
     */
    _synonyms(button) {
        if (typeof button !== 'undefined') {
            for (var i = 0; i < this._SYNONIEM_MAP.length; i++) {
                for (var j = 0; j < this._SYNONIEM_MAP[i].length; j++) {
                    if (this._SYNONIEM_MAP[i][j] == button) {
                        return this._SYNONIEM_MAP[i];
                        break;
                    }
                }
            }
        } else {
            return null;
        }
    }

    /** Clear all pending mouse input. */
    flush() {
        // Always returns false because flusihing is not possible.
        return false;
    }

    /**
     * Collects a single mouse click.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} buttonList - List of acceptable response buttons.
     * @param {Boolean} visible - Toggle for showing the mouse cursor.
     */
    get_click(timeOut, buttonList, visible) {
        // Collects a single mouse click.
        this._timeOut = (typeof timeOut === 'undefined') ? this._timeOut : timeOut;
        this._buttonList = (typeof buttonList === 'undefined') ? this._buttonList : buttonList;
        this._visible = (typeof visible === 'undefined') ? this._visible : visible;

        if (this._experiment !== null) {
            // Hide or show the mouse.
            this.show_cursor(this._visible);

            // Set the event processor.
            this._experiment._runner._events._run(this._timeOut, constants.RESPONSE_MOUSE, this._buttonList);
        };
    }

    /**
     *  Returns the current mouse position. !Warning: this methods uses the state in
     *  the last known mouse move, not the current state.
     *  @param {Object} - Object with time, x and y coordinate of the mouse cursor.
     */
    get_pos() {
        // Returns the current mouse position. !Warning: this methods uses the state in the last known mouse respone, not the current state.
        if (this._experiment._runner._events._mouseMoveEvent !== null) {
            return {
                'rtTime': this._experiment._runner._events._mouseMoveEvent.rtTime,
                'x': this._experiment._runner._events._mouseMoveEvent.event.clientX,
                'y': this._experiment._runner._events._mouseMoveEvent.event.clientY
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
        if (this._experiment._runner.events._mouse_press !== null) {
            return {
                'buttons': [(this._experiment._runner._events._mouseDownEvent.event.button === 0), 
                            (this._experiment._runner._events._mouseDownEvent.event.button === 1), 
                            (this._experiment._runner._events._mouseDownEvent.event.button === 2)]
            };
        } else {
            return {
                'buttons': [null, null, null]
            };
        }
    }

    /** Sets the current position of the cursor. */	
    set_pos(pos) {
    }

    /**
     * Shows or hides the mouse cursor.		
     * @param {Boolean} show - If true the mouse cursor is shown.
     */
    show_cursor(show) {
        // Set the property
        this._visible = show;

        // Immediately changes the visibility of the mouse cursor.	
        if (show === true) {
            // Show the mouse cursor.
            this._experiment._runner._renderer.view.style.cursor = 'default';
        } else {
            // Set the cursor visibility to none.
            this._experiment._runner._renderer.view.style.cursor = 'none';
        }
    }
} 
 