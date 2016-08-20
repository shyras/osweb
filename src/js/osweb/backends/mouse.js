// Definition of the class mouse.
function mouse(experiment, timeout, buttonlist, visible) {
    // Set the class public properties. 
    this.experiment = experiment; // Anchor to the experiment object.
    this.timeout = (typeof timeout === 'undefined') ? null : timeout; // Duration in millisecond for time-out. 
    this.buttonlist = (typeof buttonlist === 'undefined') ? null : buttonlist; // List of acceptable response buttons.	
    this.visible = (typeof visible === 'undefined') ? false : visible; // if true the mouse cursor is visible.
};

// Extend the class from its base class.
var p = mouse.prototype;

// Definition of public properties. 
p.experiment = null;
p.buttonlist = [];
p.timeout = -1;
p.visible = false;

// Definition of the synoniem map for all keys.                                  
p.SYNONIEM_MAP = [
    ['1', 'left_button'],
    ['2', 'middle_button'],
    ['3', 'right_button'],
    ['4', 'scroll_up'],
    ['5', 'scroll_down']
];

// Definition of private methods.

p._get_default_from_synoniem = function(responses) {
    // Return the default synoniem value from a response.
    var defaults = [];
    for (var i = 0; i < responses.length; i++) {
        var synoniem = this.synonyms(responses[i]);
        defaults.push(synoniem[0]);
    }
    return defaults;
};

// Definition of class public methods.

p.default_config = function() {
    // Return the default configuration.
    return {
        'timeout': null,
        'buttonlist': null,
        'visible': false
    };
};

p.flush = function() {
    // Clears all pending mouse input, not limited to the mouse.
    osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'mouse.flush().');
};

p.get_click = function(timeout, buttonlist, visible) {
    // Collects a single mouse click.
    this.timeout = (typeof timeout === 'undefined') ? this.timeout : timeout;
    this.buttonlist = (typeof buttonlist === 'undefined') ? this.buttonlist : buttonlist;
    this.visible = (typeof visible === 'undefined') ? this.visible : visible;

    if (this.experiment != null) {
        // Hide or show the mouse.
        this.show_cursor(this.visible);

        // Set the event processor.
        osweb.events._run(this, this.timeout, osweb.constants.RESPONSE_MOUSE, this.buttonlist);
    };
};

p.get_pos = function() {
    // Returns the current mouse position. !Warning: this methods uses the state in the last known mouse respone, not the current state.
    if (osweb.events._mouse_move !== null) {
        return {
            'rtTime': osweb.events._mouse_move.rtTime,
            'x': osweb.events._mouse_move.event.clientX,
            'y': osweb.events._mouse_move.event.clientY
        };
    } else {
        return {
            'rtTime': -1,
            'x': -1,
            'y': -1
        };
    }
};

p.get_pressed = function() {
    // Returns the current button state of the mouse buttons. !Warning: this methods uses the state in the last known mouse respone, not the current state.
    if (osweb.events._mouse_press !== null) {
        return {
            'buttons': [(osweb.events._mouse_press.button === 0), (osweb.events._mouse_press.button === 1), (osweb.events._mouse_press.button === 2)]
        };
    } else {
        return {
            'buttons': [null, null, null]
        };
    }
};

p.set_config = function(timeout, buttonlist, visible) {
    // Set mouse properties.          
    this.timeout = timeout;
    this.buttonlist = buttonlist;
    this.visible = visible;
};

p.set_pos = function(pos) {
    // Returns the current position of the cursor.	
    osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'mouse.set_pos().');
};

p.show_cursor = function(visible) {
    // Set the property
    this.visible = visible;

    // Immediately changes the visibility of the mouse cursor.	
    if (visible === true) {
        // Show the mouse cursor.
        osweb.runner._stage.canvas.style.cursor = "default";
    } else {
        // Set the cursor visibility to none.
        osweb.runner._stage.canvas.style.cursor = "none";
    }
};

p.synonyms = function(button) {
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
};

// Bind the mouse class to the osweb namespace.
module.exports = mouse;