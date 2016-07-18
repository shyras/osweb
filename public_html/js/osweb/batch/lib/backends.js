
(function() {
// Definition of the class canvas.
    function canvas(experiment, auto_prepare) {
	// set the class public properties.
        this.auto_prepare = (typeof auto_prepare === 'undefined') ? true : auto_prepare; // Set autoprepare toggle (not supported yet). 	
	this.experiment = experiment;                                                    // Anchor to the experiment object.
		
        // Set the public properties. 
    	this.background_color = this.experiment.vars.background;                         // Backgropund color of canvas.     
        this.bidi = (this.experiment.vars.bidi === 'yes');                               // If true bidi mode is enabled.
        this.color = this.experiment.vars.foregound;                                     // Foreground color of canvas.
        this.fill = false;                                                               // If true fill mode is used.
        this.font_bold = (this.experiment.vars.font_bold === 'yes');                     // If true font style bold is enabled.
        this.font_family = (this.experiment.vars.font_family);                           // Family name of the font used.
        this.font_italic = (this.experiment.vars.font_italic === 'yes');                 // If true font style italic is enabled.
        this.font_size = (this.experiment.vars.font_size);                               // Size of the font in pixels.
        this.font_underline = (this.experiment.vars.font_underline === 'yes');           // If true font style underline is enabled.
        this.html = true;                                                                // If true html is used (not supported yet).
        this.penwidth = 1;                                                               // Default penwidth for drawing shapes. 
        
        // Set the private properties.  
    	this._container = new createjs.Container();                                      // EASELJS: Container which holds the shapes
        this._font_string = 'bold 18px Courier New';                                     // EASELJS: Default font definition string.
	this._height = osweb.runner._canvas.height;                                      // Height of the HTML canvas used for drawing.
	this._width = osweb.runner._canvas.width;                                        // Width of the HTML canvas used for drawing.
    }; 
	
    // Extend the class from its base class.
    var p = canvas.prototype;
    
    // Definition of public properties. 
    p.auto_prepare= false;
    p.experiment = null;
    p.uniform_coordinates = false;
	
    // Definition of private methods. 
    
    p._arrow_shape = function(sx, sy, ex, ey, body_length, body_width, head_width) {
        // Length
        var d = Math.sqrt(Math.pow(ey - sy,2) + Math.pow(sx - ex,2));
        var angle = Math.atan2(ey - sy, ex - sx);
	var _head_width = (1 - body_width) / 2.0;
	body_width = body_width / 2.0;
	
        // calculate coordinates
	var p4 = [ex, ey];
	var p1 = [sx + body_width * head_width * Math.cos(angle - Math.PI / 2), sy + body_width * head_width * Math.sin(angle - Math.PI / 2)];
	var p2 = [p1[0] + body_length * Math.cos(angle) * d, p1[1] + body_length * Math.sin(angle) * d];
	var p3 = [p2[0] + _head_width * head_width * Math.cos(angle - Math.PI / 2), p2[1] + _head_width * head_width * Math.sin(angle - Math.PI / 2)];
	var p7 = [sx + body_width * head_width * Math.cos(angle + Math.PI / 2), sy + body_width * head_width * Math.sin(angle + Math.PI / 2)];
	var p6 = [p7[0] + body_length * Math.cos(angle) * d, p7[1] + body_length * Math.sin(angle) * d];
	var p5 = [p6[0] + _head_width * head_width * Math.cos(angle + Math.PI / 2), p6[1] + _head_width * head_width * Math.sin(angle + Math.PI / 2)];
	
        return [p1, p2, p3, p4, p5, p6, p7];
    };    
        
    // Definition of public methods. 
    
    p.arrow = function (sx, sy, ex, ey, color, penwidth, body_length, body_width, head_width, fill) {
        var points = this._arrow_shape(sx, sy, ex, ey, body_width, body_length, head_width);
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(penwidth);
	shape.graphics.beginStroke(color);
        
        shape.graphics.moveTo(points[0][0],points[0][1]);
	shape.graphics.lineTo(points[1][0],points[1][1]);
	shape.graphics.lineTo(points[2][0],points[2][1]);
	shape.graphics.lineTo(points[3][0],points[3][1]);
	shape.graphics.lineTo(points[4][0],points[4][1]);
	shape.graphics.lineTo(points[5][0],points[5][1]);
	shape.graphics.lineTo(points[6][0],points[6][1]);
	shape.graphics.lineTo(points[0][0],points[0][1]);
	
       	// Add the line item to container.
	this._container.addChild(shape); 
    }; 
    		
    p.circle = function(x, y, r, fill, color, penwidth) {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(penwidth);
	shape.graphics.beginStroke(color);
	if (fill == 1)
	{
            shape.graphics.beginFill(color);
	}
	shape.graphics.drawCircle(x, y, r);
		
	// Add the line item to container.
	this._container.addChild(shape); 
    };

    p.clear = function(backround_color) {
	// Remove the container from the stage object.
	osweb.runner._stage.removeChild(this._container);
	
        // Remove the children from the container.
        this._container.removeAllChildren();
    };

    p.close_display = function(experiment) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.close_display().');
    };

    p.copy = function(canvas) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.copy().');
    };

    p.ellipse = function(x, y, w, h, fill, color, penwidth) {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(penwidth);
	shape.graphics.beginStroke(color);
	if (fill == 1)
	{
            shape.graphics.beginFill(color);
	}
	shape.graphics.drawEllipse(x, y, w, h); 

	// Add the text item to the parten frame.
	this._container.addChild(shape);
    };

    p.fixdot = function(x, y, color, style) {
        // Check the color and style arguments.      
        color = (typeof color === 'undefined') ? 'white' : color;
        style = (typeof style === 'undefined') ? 'default' : style;
        
        if (typeof x === 'undefined') {
            if (this.uniform_coordinates === true) {
		x = 0;
            }
            else {
                x = this._width / 2;
            }
	}
	if (typeof y === 'undefined') {
            if (this.uniform_coordinates === true) {
		y = 0;
            }
            else {
		y = this._height / 2;
            }	
	}
		
	var s = 4;
	var h = 2;
	if (style.indexOf('large') !== -1) {
            s = 16;
	}
	else if ((style.indexOf('medium') !== -1) || (style === 'default')) {
            s = 8;
	}
	else if (style.indexOf('small') !== -1) {
            s = 4;
	}
	else {
            osweb.debug.addError('Unknown style: ' + style);
	}	
		
	if ((style.indexOf('open') !== -1) || (style === 'default')) {	
            this.ellipse(x - s, y - s, 2 * s, 2 * s, 1, color, 1);
            this.ellipse(x - h, y - h, 2 * h, 2 * h, 1, 'black', 1);
	}
	else if (style.indexOf('filled') !== -1)	{	
            this.ellipse(x - s, y - s, 2 * s, 2 * s, 1, color, 1);
	}
        else if (style.indexOf('cross') !== -1)	{
            this.line(x, y - s, x, y + s);
            this.line(x - s, y, x + s, y);
	}
	else {
            osweb.debug.addError('Unknown style: ' + style);
	}	
    };

    p.gabor = function(x, y, orient, freq, env, size, stdev, phase, color1, color2, bgmode) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.gabor().');
    };

    p.height = function() {
    	return this._heigth();
    };

    p.image = function(fname, center, x, y, scale) {
	// Set the class private properties. 
	var image = new createjs.Bitmap();
        image.image = fname.data;
	image.scaleX = scale;
        image.scaleY = scale;
        image.snapToPixel = true;
        image.x = x - ((image.image.width  * scale) / 2);
    	image.y = y - ((image.image.height * scale) / 2);
	
	// Add the text item to the parten frame.
	this._container.addChild(image);
    };
	
    p.init_display = function(experiment) {
	// Set the dimension properties.
	this._height = experiment.vars.height;
    	this._width  = experiment.vars.width;
	
	// Initialize the display dimensions.
	osweb.runner._canvas.height = experiment.vars.height;
	osweb.runner._canvas.width  = experiment.vars.width;
		
	// Initialize the display color.
	osweb.runner._canvas.style.background = experiment.vars.background;

        // Set the cursor visibility to none (default).
        osweb.runner._canvas.style.cursor = 'none';

        // Set focus to the experiment canvas.
        osweb.runner._canvas.focus(); 
    };

    p.line = function(sx, sy, ex, ey, color, penwidth) {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(penwidth);
	shape.graphics.beginStroke(color);
	shape.graphics.moveTo(sx, sy);
	shape.graphics.lineTo(ex, ey); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.noise_patch = function(pX, pY, pEnv, pSize, pStdev, pColor1, pColor2, pBgmode) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.noise_patch().');
    };
	
    p.polygon = function(verticles) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.polygon().');
    };
	
    p.prepare = function() {
    };
	
    p.rect = function(x, y, w, h, fill, color, penwidth) {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(penwidth);
	shape.graphics.beginStroke(color);
	if (fill == 1)
	{
            shape.graphics.beginFill(color);
	}
	shape.graphics.rect(x, y, w, h); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.set_font = function(family, size, italic, bold, underline) {
   	// Define the the font styles.
    	var font_bold = (bold === true) ? 'bold ' : '';
        var font_italic = (italic === true) ? 'italic ' : '';
        var font_underline = (underline === true) ? 'underline ' : '';
        
        // Set the font string.
        this._font_string = font_bold + font_italic + font_underline + size + 'px ' + family; 
     };
        
    p.show = function() {
    	// Add the container to the stage object and update the stage.
	osweb.runner._stage.addChild(this._container);
	osweb.runner._stage.update(); 

	// Return the current time.
	if (this.experiment != null) {
            return this.experiment.clock.time();
        }    
        else {    
            return null;
        }
    };
	
    p.size = function() {
    	// Create object tuple.
    	var size = {width: this._width, height: this._height};
	return size;
    };
	
    p.text = function(text, center, x, y , color, html) {
	// Create the text element.          
	var text_element = new createjs.Text(text, this._font_string, color);

	// Set the text element properties.
	text_element.x = x - (text_element.getMeasuredWidth() / 2);
	text_element.y = y - (text_element.getMeasuredHeight() / 2);
		 
	// Add the text item to the parten frame.
	this._container.addChild(text_element);
    };

    p.text_size = function(text, max_width, style_args) {
        // Return the text size in pixels.
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.text_size().');
    };

    // Bind the canvas class to the osweb namespace.
    osweb.canvas = canvas;
}());


(function() {
    // Definition of the class clock.
    function clock(experiment) {
        // Definition of private properties. 
        this._startTime = this._now();                     // Start time anchor of the experiment.
		
        // Set the class public properties. 
	this.experiment = experiment;                      // Anchor to the experiment object.
    }; 
	
    // Extend the class from its base class.
    var p = clock.prototype;
    
    // Definition of public properties. 
    p.experiment = null;

    // Definition of private methods.   
    
    p._now = function() {
	// Get the current time stamp using the best available timing method.
	if (window.performance.now) {
            return Math.round(window.performance.now());
	} 
	else if (window.performance.webkitNow) {
            return Math.round(window.performance.webkitNow());
	} 
	else {
            return new Date().getTime();
	}
    };

    // Definition of public methods.   

    p.initialize = function() {
        // Set the absolute start time of the expeirment.
        this._startTime = this._now();
    };

    p.sleep = function(duration) {
        // Sleeps (pauses) for a duration (in milliseconds).
	if (this.experiment !==  null) {
            // Set the event processor.
            osweb.events._run(this, duration, osweb.constants.RESPONSE_DURATION, null);
	}
    };
	
    p.time = function() {
        // Gives the current timestamp in milliseconds. 
        if (this._startTime !== -1) {
            return (this._now() - this._startTime);
        }    
        else {
            return 0;
        }    
    };
 	
    // Bind the clock class to the osweb namespace.
    osweb.clock = clock;
}());


(function() {
    // Definition of the class keyboard.
    function keyboard(experiment, timeout, keylist) {
        // Set the public properties. 
	this.experiment = experiment;                                          // Anchor to the experiment object. 
	this.keylist = (typeof keylist === 'undefined') ? [] : keylist;	       // List of acceptable response keys. 
	this.timeout = (typeof timeout === 'undefined') ? null : timeout;      // Duration in millisecond for time-out.
    }; 
	
    // Extend the class from its base class.
    var p = keyboard.prototype;
    
    // Definition of public properties. 
    p.experiment = null;
    p.keylist = [];
    p.timeout = null;
	
    // Definition of the synoniem map for all keys.                                  
    p.SYNONIEM_MAP = [[' ','space','SPACE'],['"','quotedbl','QUOTEDBL'],['!','exclaim','EXCLAIM'],['#','hash','HASH'],
        ['$','dollar','DOLLAR'],['&','ampersand','AMPERSAND'],["'",'quote','QUOTE'],['(','leftbracket','leftparen','LEFTBRACKET','LEFTPAREN'],
        [')','rightbracket','rightparen','RIGHTBRACKET','RIGHTPAREN'],['*','asteriks','ASTERISK'],['+','plus','PLUS'],[',','comma','COMMA'],
        ['-','minus','MINUS'],['.','period','PERIOD'],['/','slash','SLASH'],
        ['1'],['2'],['3'],['4'],['5'],['6'],['7'],['8'],['9'],['0'],['=','equals','EQUALS'],
        [':','colon','COLON'],[';','semicolon','SEMICOLON'],['<','less','LESS'],['>','greater','GREATER'],
        ['?','question','QUESTION'],['@','at','AT'],
        ['a','A'],['b','B'],['c','C'],['d','D'],['e','E'],['f','F'],
        ['g','G'],['h','H'],['i','I'],['j','J'],['k','K'],['l','L'],
        ['m','M'],['n','N'],['o','O'],['p','P'],['q','Q'],['r','R'],
        ['s','S'],['t','T'],['u','U'],['v','V'],['w','W'],['x','X'],
        ['y','Y'],['z','Z'],
        ['kp0','KP0'],['kp1','KP1'],['kp2','KP2'],['kp3','KP3'],['kp4','KP4'],['kp5','KP5'],['kp6','KP6'],['kp7','KP7'],['kp8','KP8'],['kp9','KP9'],  
        ['kp_divide','KP_DIVIDE'],['kp_enter','KP_ENTER'],['kp_equals','KP_EQUALS'],['kp_minus','KP_MINUS'],['kp_multiply','KP_MULTIPLY'],['kp_period','KP_PERIOD'],['kp_plus','KP_PLUS'],
        ['\\','backslash','BACKSLASH'],['^','power','caret','POWER','CARET'],['_','underscore','UNDERSCORE'],['`','backquote','BACKQUOTE'],
        ['f1','F1','help','HELP'],['f2','F2'],['f3','F3'],['f4','F4'],['f5','F5'],['f6','F6'],
        ['f7','F7'],['f8','F8'],['f9','F9'],['f10','F10'],['f11','F11'],['f12','F12'],
        ['f13','F13'],['f14','F14'],['f15','F15'],
        ['up','UP'],['down','DOWN'],['left','LEFT'],['right','RIGHT'],['menu','MENU'],
        ['lshift','left shift','LSHIFT','LEFT SHIFT'],['lctrl','left ctrl','LCTRL','LEFT CTRL'],['lalt','left alt','LALT','LEFT ALT'],
        ['rshift','right shift','RSHIFT','RIGHT SHIFT'],['rctrl','right ctrl','RCTRL','RIGHT CTRL'],['ralt','right alt','alt gr','RALT','RIGHT ALT','ALT GR'],
        ['page up','pageup','PAGE UP','PAGEUP'],['page down','pagedown','PAGE DOWN','PAGEDOWN'],['pause','PAUSE'],
        ['scroll lock','scrollock','SCROLL LOCK','SCROLLOCK'],['caps lock','capslock','CAPS LOCK','CAPSLOCK'],['nummlock','NUMMLOCK'],
        ['clear','CLEAR'],['enter','ENTER','return','RETURN'],['tab','TAB'],['backspace','BACKSPACE'],['end','END'],['home','HOME'],['insert','INSERT'],['delete','DELETE'],
        ['sysreq','sys req','SYSREQ','SYS REQ'],['break','BREAK'],['escape','ESCAPE'],['print','PRINT'],['print screen','PRINT SCREEN'],
        ['lmeta','left meta','LMETA','LEFT META',,'lsuper','LSUPER','left super','LEFT SUPER'],                  
        ['rmeta','right meta','RMETA','RIGHT META','rsuper','right super','RSUPER','RIGHT SUPER'],                  
        // key defined below are not supported yet.
        ['euro','EURO'],['first','FIRST'],['last','LAST'],['kp enter','KP ENTER'],['kp equals','KP EQUALS'],
        ['mode','MODE'],['unknown','UNKNOWN'],['unknown key','UNKNOWN KEY']];  

    // Definition of private methods.

    p._get_default_from_synoniem = function(responses) {
        var defaults = [];
        for (var i = 0;i < responses.length; i++) {
            var synoniem = this.synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;    
    };
    
    // Definition of public methods.

    p.default_config = function() {
        // Return the default configuration.
	return {'timeout': null, 'keylist': []};
    };
    
    p.flush = function() {
	// Clear all pending keyboard input, not limited to the keyboard.
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'keyboard.flush().');
    };
 	
    p.get_key = function(timeout, keylist) {
	// Collects a single key press.
	this.keylist = (typeof keylist === 'undefined') ? this.keylist : keylist;	
	this.timeout = (typeof timeout === 'undefined') ? this.timeout : timeout;
		
	if (this.experiment != null) {
            // Set the event processor.
            osweb.events._run(this, this.timeout, osweb.constants.RESPONSE_KEYBOARD, this.keylist);
	};
    };

    p.get_mods = function() {
    	var moderators = [];
        if (osweb.events._keyboard_event !== null) {
            if (osweb.events._keyboard_event.shiftKey === true) {
                moderators.push('shift');
            };    
            if (osweb.events._keyboard_event.ctrlKey === true) {
                moderators.push('ctrl');
            };    
            if (osweb.events._keyboard_event.altKey === true) {
                moderators.push('alt');
            };    
        } 
        return moderators;    
    };

    p.set_config = function(timeout, keylist) {
	// Set the properties.
	this.keylist = keylist;	
	this.timeout = timeout;
    };
	
    p.show_virtual_keyboard = function(visible) {
        // Shows or hides a virtual keyboard.		
    	if (visible === true) {
            // Hack to show the virutal keyboard. ## Must be tested!
            osweb.runner._canvas.setfocus();
	}
	else {
            // Hack to hide the virtual keyboard. ## Must be tested!
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
	}
    };

    p.synonyms = function(button) {
        if (typeof button !== 'undefined') {
            for (var i = 0;i < this.SYNONIEM_MAP.length;i++) {
                for (var j = 0;j < this.SYNONIEM_MAP[i].length; j++) {
                    if (this.SYNONIEM_MAP[i][j] == button) {
                        return this.SYNONIEM_MAP[i];
                        break;
                    }
                }   
            }
        }
        else {
            return null;
        }    
    };

    // Bind the keyboard class to the osweb namespace.
    osweb.keyboard = keyboard;
}());

(function() {
    // Definition of the class log.
    function log(experiment, path) {
        // Set the class private properties. 
    	this._all_vars = null;                             // If true all variables are written to the log.  
	this._header_written = false;	                   // If true the header has been written to the log.
	this._log = [];                                    // Array containing the log entries.
	this._path = '';                                   // Path to wich the log is written.

        // Set the class public properties. 
	this.experiment = experiment;                      // Anchor to the experiment object.
    	this.experiment.vars.logfile = path;               // Store the path location into the vars list.   
    }; 
	
    // Extend the class from its base class.
    var p = log.prototype;
    
    // Definition of public properties. 
    p.experiment = null;
	
    // Definition of public methods.   

    p.all_vars = function() {
	// Retrieves a list of all variables that exist in the experiment.
	if (this._all_vars === null) {
            this._all_vars = this.experiment.vars.inspect();
	}
	return this._all_vars;
    };

    p.close = function() {
	// Closes the current log.
	if (this._log.length > 0) {
            // Echo the data to the runner.
            osweb.runner.data = this._log.join('');    
        };

	// Clear the log file.
	this._log = [];
    };

    p.flush = function() {
    	// Flush the log file.
        this._log = [];
    };

    p.open = function(path) {	
	// Opens the current log. If a log was already open, it is closed.
	this._header_written = false;
	this._path = path; 
	
	// Check for old data.
	if (this._log !== null) {
            // Clear the old data.
            this.close();
	}
    };

    p.write = function(msg, new_line) {
    	// Write one message to the log.
	new_line = (typeof new_line === 'undefined') ? true : new_line;
	
	// Write a new line.
	if (new_line === true) {
            this._log.push(msg + '\n');
	}
	else {
            // Write the Message line.
            this._log.push(msg);
	}
    };

    p.write_vars = function(var_list) {
    	// Writes variables to the log.
	var_list = (typeof var_list === 'undefined') ? null : var_list;
		
	var value; 
	var l = [];
        // If no var list defines, retrieve all variable.
	if (var_list == null) {
            var_list = this.all_vars();
	}

        // Sort the var list.
        var_list.sort();
        
	// Add the header to the log file.
        if (this._header_written === false) {
            for (var i = 0; i < var_list.length; i++) {
		l.push('"' + var_list[i] + '"');
            }		
            this.write(l.join());
            this._header_written = true;
	}
		
        // Add the data entries to the log file.        
        l = [];
	for (var i = 0; i < var_list.length; i++) {
            value = this.experiment.vars.get(var_list[i], 'NA', false);
            l.push('"' + value + '"');
	}
        this.write(l.join());
    };
 	
    // Bind the log class to the osweb namespace.
    osweb.log = log;
}());

(function() {
    // Definition of the class mouse.
    function mouse(experiment, timeout, buttonlist, visible)
    {
        // Set the class public properties. 
	this.experiment = experiment;                                               // Anchor to the experiment object.
	this.timeout = (typeof timeout === 'undefined') ? null : timeout;           // Duration in millisecond for time-out. 
	this.buttonlist = (typeof buttonlist === 'undefined') ? null : buttonlist;  // List of acceptable response buttons.	
	this.visible = (typeof visible === 'undefined') ? false : visible;	    // if true the mouse cursor is visible.
    }; 
	
    // Extend the class from its base class.
    var p = mouse.prototype;
    
    // Definition of public properties. 
    p.experiment = null;
    p.buttonlist = [];
    p.timeout = -1;
    p.visible = false;
	
    // Definition of the synoniem map for all keys.                                  
    p.SYNONIEM_MAP = [['1','left_button'], ['2','middle_button'], ['3','right_button'], ['4','scroll_up'], ['5','scroll_down']];
        
    // Definition of private methods.

    p._get_default_from_synoniem = function(responses) {
        // Return the default synoniem value from a response.
        var defaults = [];
        for (var i = 0;i < responses.length;i++) {
            var synoniem = this.synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;    
    };

    // Definition of class public methods.
    
    p.default_config = function() {
        // Return the default configuration.
        return {'timeout': null, 'buttonlist': null, 'visible': false};
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
            return {'rtTime': osweb.events._mouse_move.rtTime, 'x': osweb.events._mouse_move.event.clientX, 'y': osweb.events._mouse_move.event.clientY};
        }
        else {
            return {'rtTime': -1, 'x': -1, 'y': -1};
        }    
    };

    p.get_pressed = function() {
        // Returns the current button state of the mouse buttons. !Warning: this methods uses the state in the last known mouse respone, not the current state.
        if (osweb.events._mouse_press !== null) {
            return { 'buttons': [(osweb.events._mouse_press.button === 0), (osweb.events._mouse_press.button === 1), (osweb.events._mouse_press.button === 2)]};
        }
        else {
            return { 'buttons': [null, null, null]};
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
	}
	else {
            // Set the cursor visibility to none.
            osweb.runner._stage.canvas.style.cursor = "none";
        }
    };

    p.synonyms = function(button)
    {
        if (typeof button !== 'undefined') {
            for (var i = 0;i < this.SYNONIEM_MAP.length;i++) {
                for (var j = 0;j < this.SYNONIEM_MAP[i].length;j++) {
                    if (this.SYNONIEM_MAP[i][j] == button) {
                        return this.SYNONIEM_MAP[i];
                        break;
                    }
                }   
            }
        }
        else {
            return null;
        }    
    };

    // Bind the mouse class to the osweb namespace.
    osweb.mouse = mouse;
}()); 


(function() {
    // Definition of the class sampler.
    function sampler(experiment, src, volume, pitch, pan, duration, fade, block) {
      	// Set the class public properties. 
	this.experiment = experiment;
	
	// Check if optional parameters are defined.
	this.block = (typeof block === 'undefined') ? false : block;	
	this.duration = (typeof duration === 'undefined') ? 'sound' : duration;	
	this.fade = (typeof fade === 'undefined') ? 0 : fade;	
	this.pan = (typeof pan === 'undefined') ? 0 : pan;	
	this.pitch = (typeof pitch === 'undefined') ? 1 : pitch;	
	this.src = (typeof src === 'undefined') ? '' : src;	
	this.volume = (typeof volume   === 'undefined') ? 1 : volume;	

	// Create the sound instance
	if (src !== null) {
            // Set the sound object.
            this._instance = src.data;
		
            // Set the event anchor for 
            this._instance.on("ended", osweb.events._audioEnded.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = sampler.prototype;
    
    // Definition of public properties. 
    p.duration = 'sound';	
    p.block = false;
    p.fade = '0';
    p.pan = '0';
    p.pitch = '1';
    p.src = null;
    p.volume = 1;
    
    // Definition of public methods.

    p.play = function(volume, pitch, pan, duration, fade, block) {
	// Check if optional parameters are defined.
	this.block = (typeof block === 'undefined') ? this.block : block;	
	this.duration = (typeof duration === 'undefined') ? this.duration : duration;	
	this.fade = (typeof fade === 'undefined') ? this.fade : fade;	
	this.pan = (typeof pan === 'undefined') ? this.pan : pan;	
	this.pitch = (typeof pitch === 'undefined') ? this.pitch : pitch;	
	this.volume = (typeof volume === 'undefined') ? this.volume : volume;	

	// Set the sound properties.
	this._instance.volume = this.volume;
		
	// Play the actual sound.
	this._instance.play();	
    };

    p.wait = function() {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_SOUND,[]);
    };
    
    // Bind the sampler class to the osweb namespace.
    osweb.sampler_backend = sampler;
}());


(function() {
    // Definition of the class video.
    function video(experiment, src) {
      	// Set the class public properties. 
	this.experiment = experiment;
	
        // Set the class pivate properties. 
        this._playing = false; 
        this._script = null;

	// Create the video instance
	if (src !== null) {
            // Set the video object.
            this._ctx = osweb.runner._canvas.getContext('2d');
            this._video = src.data;
            
            // Set the event anchors.
            this._video.on("ended", osweb.events._videoEnded.bind(this));
            this._video.on("play" , osweb.events._videoPlay.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = video.prototype;
    
    // Definition of public properties. 
    p.audio = true;
    p.duration = 'keypress';	
    p.full_screen = false;
    
    // Definition of private methods.
    
    p._update_video_canvas = function() {
        // Clip the content of the video to the canvas.
        if (this._playing === true) {    
            this._ctx.drawImage(this._video, 0, 0);

            // execute script.
            if ((this._script !== null) && (this._event_handler_always === true)) {
                // Start the parser
                osweb.parser._run(null, this._script);    		
            }    
        }    
    };    
    
    // Definition of public methods.
    
    p.play = function() {
	// Play the actual video.
        this._video.play();
        
        // Set the volume
        this._video.volume = (this.audio === true) ? 1 : 0;
        
        // Check if the video must be scaled.
        if (this.full_screen == true) {    
            // Draw the first image with scaling.
            var xScale = (this.experiment._canvas._width  / this._video.videoWidth);
            var yScale = (this.experiment._canvas._height / this._video.videoHeight);
            this._ctx.scale(xScale,yScale);
        }
        
        // Draw the first frame.
        this._ctx.drawImage(this._video, 0, 0);
        
        // Set the play toggle.
        this._playing = true;
    };

    p.stop = function() {
	// Pause the actual sound.
	this._video.pause();
        this._playing = false;
    };

    p.wait = function() {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_VIDEO,[]);
    };
    
    // Bind the video class to the osweb namespace.
    osweb.video_backend = video;
}());
