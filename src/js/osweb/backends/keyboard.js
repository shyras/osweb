
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
