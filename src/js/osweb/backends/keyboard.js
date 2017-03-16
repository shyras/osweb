/** Class representing a keyboard device. */
export default class Keyboard {
    /**
     * Create an object which represents a keyboard device.
     * @param {Object} experiment - The experiment to which the logger belongs.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} keyList - List of acceptable response keys.
     */
    constructor(experiment, timeOut, keyList) {
        // Create and set private properties. 
        this.experiment = experiment; // Anchor to the experiment object. 
        this.keylist = (typeof keylist === 'undefined') ? [] : keylist; // List of acceptable response keys. 
        this.timeout = (typeof timeout === 'undefined') ? null : timeout; // Duration in millisecond for time-out.

        // Set constant properties.
        this.SYNONIEM_MAP = [
            [' ', 'space', 'SPACE'],
            ['"', 'quotedbl', 'QUOTEDBL'],
            ['!', 'exclaim', 'EXCLAIM'],
            ['#', 'hash', 'HASH'],
            ['$', 'dollar', 'DOLLAR'],
            ['&', 'ampersand', 'AMPERSAND'],
            ["'", 'quote', 'QUOTE'],
            ['(', 'leftbracket', 'leftparen', 'LEFTBRACKET', 'LEFTPAREN'],
            [')', 'rightbracket', 'rightparen', 'RIGHTBRACKET', 'RIGHTPAREN'],
            ['*', 'asteriks', 'ASTERISK'],
            ['+', 'plus', 'PLUS'],
            [',', 'comma', 'COMMA'],
            ['-', 'minus', 'MINUS'],
            ['.', 'period', 'PERIOD'],
            ['/', 'slash', 'SLASH'],
            ['1'],
            ['2'],
            ['3'],
            ['4'],
            ['5'],
            ['6'],
            ['7'],
            ['8'],
            ['9'],
            ['0'],
            ['=', 'equals', 'EQUALS'],
            [':', 'colon', 'COLON'],
            [';', 'semicolon', 'SEMICOLON'],
            ['<', 'less', 'LESS'],
            ['>', 'greater', 'GREATER'],
            ['?', 'question', 'QUESTION'],
            ['@', 'at', 'AT'],
            ['a', 'A'],
            ['b', 'B'],
            ['c', 'C'],
            ['d', 'D'],
            ['e', 'E'],
            ['f', 'F'],
            ['g', 'G'],
            ['h', 'H'],
            ['i', 'I'],
            ['j', 'J'],
            ['k', 'K'],
            ['l', 'L'],
            ['m', 'M'],
            ['n', 'N'],
            ['o', 'O'],
            ['p', 'P'],
            ['q', 'Q'],
            ['r', 'R'],
            ['s', 'S'],
            ['t', 'T'],
            ['u', 'U'],
            ['v', 'V'],
            ['w', 'W'],
            ['x', 'X'],
            ['y', 'Y'],
            ['z', 'Z'],
            ['kp0', 'KP0'],
            ['kp1', 'KP1'],
            ['kp2', 'KP2'],
            ['kp3', 'KP3'],
            ['kp4', 'KP4'],
            ['kp5', 'KP5'],
            ['kp6', 'KP6'],
            ['kp7', 'KP7'],
            ['kp8', 'KP8'],
            ['kp9', 'KP9'],
            ['kp_divide', 'KP_DIVIDE'],
            ['kp_enter', 'KP_ENTER'],
            ['kp_equals', 'KP_EQUALS'],
            ['kp_minus', 'KP_MINUS'],
            ['kp_multiply', 'KP_MULTIPLY'],
            ['kp_period', 'KP_PERIOD'],
            ['kp_plus', 'KP_PLUS'],
            ['\\', 'backslash', 'BACKSLASH'],
            ['^', 'power', 'caret', 'POWER', 'CARET'],
            ['_', 'underscore', 'UNDERSCORE'],
            ['`', 'backquote', 'BACKQUOTE'],
            ['f1', 'F1', 'help', 'HELP'],
            ['f2', 'F2'],
            ['f3', 'F3'],
            ['f4', 'F4'],
            ['f5', 'F5'],
            ['f6', 'F6'],
            ['f7', 'F7'],
            ['f8', 'F8'],
            ['f9', 'F9'],
            ['f10', 'F10'],
            ['f11', 'F11'],
            ['f12', 'F12'],
            ['f13', 'F13'],
            ['f14', 'F14'],
            ['f15', 'F15'],
            ['up', 'UP'],
            ['down', 'DOWN'],
            ['left', 'LEFT'],
            ['right', 'RIGHT'],
            ['menu', 'MENU'],
            ['lshift', 'left shift', 'LSHIFT', 'LEFT SHIFT'],
            ['lctrl', 'left ctrl', 'LCTRL', 'LEFT CTRL'],
            ['lalt', 'left alt', 'LALT', 'LEFT ALT'],
            ['rshift', 'right shift', 'RSHIFT', 'RIGHT SHIFT'],
            ['rctrl', 'right ctrl', 'RCTRL', 'RIGHT CTRL'],
            ['ralt', 'right alt', 'alt gr', 'RALT', 'RIGHT ALT', 'ALT GR'],
            ['page up', 'pageup', 'PAGE UP', 'PAGEUP'],
            ['page down', 'pagedown', 'PAGE DOWN', 'PAGEDOWN'],
            ['pause', 'PAUSE'],
            ['scroll lock', 'scrollock', 'SCROLL LOCK', 'SCROLLOCK'],
            ['caps lock', 'capslock', 'CAPS LOCK', 'CAPSLOCK'],
            ['nummlock', 'NUMMLOCK'],
            ['clear', 'CLEAR'],
            ['enter', 'ENTER', 'return', 'RETURN'],
            ['tab', 'TAB'],
            ['backspace', 'BACKSPACE'],
            ['end', 'END'],
            ['home', 'HOME'],
            ['insert', 'INSERT'],
            ['delete', 'DELETE'],
            ['sysreq', 'sys req', 'SYSREQ', 'SYS REQ'],
            ['break', 'BREAK'],
            ['escape', 'ESCAPE'],
            ['print', 'PRINT'],
            ['print screen', 'PRINT SCREEN'],
            ['lmeta', 'left meta', 'LMETA', 'LEFT META', , 'lsuper', 'LSUPER', 'left super', 'LEFT SUPER'],
            ['rmeta', 'right meta', 'RMETA', 'RIGHT META', 'rsuper', 'right super', 'RSUPER', 'RIGHT SUPER'],
            // key defined below are not supported yet.
            ['euro', 'EURO'],
            ['first', 'FIRST'],
            ['last', 'LAST'],
            ['kp enter', 'KP ENTER'],
            ['kp equals', 'KP EQUALS'],
            ['mode', 'MODE'],
            ['unknown', 'UNKNOWN'],
            ['unknown key', 'UNKNOWN KEY']
        ];
    }

    /**
     * Convert all response values to their default values (remove synoniems).
     * @param {Array} responses - A list of response values.
     * @return {Array} - List of default values for the given responses.
     */
    _get_default_from_synoniem(responses) {
        var defaults = [];
        for (var i = 0; i < responses.length; i++) {
            var synoniem = this.synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;
    }

    /**
     * Returns the default configuration for the keyboard backend.
     * @return {Object} - JSON object width the default values.
     */
    default_config() {
        // Return the default configuration.
        return {
            'timeout': null,
            'keylist': []
        };
    }

    /** Clear all pending keyboard input, not limited to the keyboard. */
    flush() {
    }

    /**
     * Collects a single key press.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} keyList - List of acceptable response keys.
     */
    get_key(timeout, keylist) {
        // Collects a single key press.
        this.keylist = (typeof keylist === 'undefined') ? this.keylist : keylist;
        this.timeout = (typeof timeout === 'undefined') ? this.timeout : timeout;

        if (this.experiment != null) {
            // Set the event processor.
            this.experiment._runner._events._run(this.timeout, osweb.constants.RESPONSE_KEYBOARD, this.keylist);
        };
    }

    /**
     * Retrieve the moderator keys (LIST, CTRL, ALT) pressed during a response.
     * @return {Array} - List of pressed moderator keys.
     */
    get_mods() {
        var moderators = [];
        if (this.experiment._runner._events.keyDownEvent !== null) {
            if (this.experiment._runner._events.keyDownEvent.event.shiftKey === true) {
                moderators.push('shift');
            };
            if (this.experiment._runner._events.keyDownEvent.event.ctrlKey === true) {
                moderators.push('ctrl');
            };
            if (this.experiment._runner._events.keyDownEvent.event.altKey === true) {
                moderators.push('alt');
            };
        }
        return moderators;
    }

    /**
     * Set the configuration for the keyboard backend.
     * @param {Number} timeOut - Duration in ms for time out.
     * @param {Array} keyList - List of acceptable response keys.
     */
    set_config(timeout, keylist) {
        // Set the properties.
        this.keylist = keylist;
        this.timeout = timeout;
    }

    /**
     * Shows or hides a virtual keyboard.		
     * @param {Boolean} visible - If true the virtual keyboard is shown.
     */
    show_virtual_keyboard(visible) {
        // Shows or hides a virtual keyboard.		
        if (visible === true) {
            // Hack to show the virutal keyboard. ## Must be tested!
            this.experiment._runner._renderer.view.focus();
        } else {
            // Hack to hide the virtual keyboard. ## Must be tested!
            var tmp = document.createElement('input');
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
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
 