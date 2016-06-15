
/*
 * Definition of the class canvas.
 */

(function() 
{
    function canvas(pExperiment, pAuto_prepare)
    {
	// set the class public properties.
	this.auto_prepare = (typeof pAuto_prepare === 'undefined') ? true                    : pAuto_prepare;	
	this.experiment   = (typeof pExperiment   === 'undefined') ? osweb.runner.experiment : pExperiment;
		
        // Set the class public properties. 
    	this.background_color = this.experiment.vars.background;
        this.bidi             = this.experiment.vars.bidi == 'yes';
        this.color            = this.experiment.vars.foregound;
        this.fill             = false;
        this.font_bold        = this.experiment.vars.font_bold == 'yes';
        this.font_family      = this.experiment.vars.font_family; 
        this.font_italic      = this.experiment.vars.font_italic == 'yes';
        this.font_size        = this.experiment.vars.font_size;        
        this.font_underline   = this.experiment.vars.font_underline == 'yes';
        this.html             = true;
        this.penwidth         = 1;
        
        // Set the class private properties. 
    	this._container   = new createjs.Container();
        this._font_string = 'bold 18px Courier New';
	this._height      = osweb.runner._canvas.height;
	this._width	  = osweb.runner._canvas.width;
    }; 
	
    // Extend the class from its base class.
    var p = canvas.prototype;
    
    // Define and set the class public properties. 
    p.auto_prepare        = false;
    p.experiment          = null;
    p.uniform_coordinates = false;
	
    /*
     * Definition of private class methods. 
     */
    
    p._arrow_shape = function(pSx, pSy, pEx, pEy, pBody_length, pBody_width, pHead_width)
    {
        // Length
        var d = Math.sqrt(Math.pow(pEy - pSy,2) + Math.pow(pSx - pEx,2));
		
        // Direction.
        var angle       = Math.atan2(pEy - pSy, pEx - pSx);
	var _head_width = (1 - pBody_width) / 2.0;
	pBody_width     = pBody_width / 2.0;
	
        // calculate coordinates
	var p4 = [pEx, pEy];
	var p1 = [pSx + pBody_width * pHead_width * Math.cos(angle - Math.PI / 2), pSy + pBody_width * pHead_width * Math.sin(angle - Math.PI / 2)];
	var p2 = [p1[0] + pBody_length * Math.cos(angle) * d, p1[1] + pBody_length * Math.sin(angle) * d];
	var p3 = [p2[0] + _head_width * pHead_width * Math.cos(angle - Math.PI / 2), p2[1] + _head_width * pHead_width * Math.sin(angle - Math.PI / 2)];
	var p7 = [pSx + pBody_width * pHead_width * Math.cos(angle + Math.PI / 2), pSy + pBody_width * pHead_width * Math.sin(angle + Math.PI / 2)];
	var p6 = [p7[0] + pBody_length * Math.cos(angle) * d, p7[1] + pBody_length * Math.sin(angle) * d];
	var p5 = [p6[0] + _head_width * pHead_width * Math.cos(angle + Math.PI / 2), p6[1] + _head_width * pHead_width * Math.sin(angle + Math.PI / 2)];
	
        return [p1, p2, p3, p4, p5, p6, p7];
    };    
        
    /*
     * Definition of public class methods. 
     */

    p.arrow = function (pSx, pSy, pEx, pEy, pColor, pPenWidth, pBody_length, pBody_width, pHead_width, pFill)
    {
        var points = this._arrow_shape(pSx, pSy, pEx, pEy, pBody_width, pBody_length, pHead_width);
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
        
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
    		
    p.circle = function(pX, pY, pR, pFill, pColor, pPenWidth)
    {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
            shape.graphics.beginFill(pColor);
	}
	shape.graphics.drawCircle(pX, pY, pR);
		
	// Add the line item to container..
	this._container.addChild(shape); 
    };

    p.clear = function(pBackround_color)
    {
	// Remove the container from the stage object.
	osweb.runner._stage.removeChild(this._container);
	this._container.removeAllChildren();
    };

    p.close_display = function(pExperiment)
    {
    	console.log('N/A: canvas.close');
    };

    p.copy = function(pCanvas)
    {
    	console.log('N/A: canvas.copy');
    };

    p.ellipse = function(pX, pY, pW, pH, pFill, pColor, pPenWidth)
    {
	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
    	shape.graphics.beginFill(pColor);
	}
	shape.graphics.drawEllipse(pX, pY, pW, pH); 

	// Add the text item to the parten frame.
	this._container.addChild(shape);
    };

    p.fixdot = function(pX, pY, pColor, pStyle)
    {
        // Check the color and style arguments.      
        pColor = (typeof pColor === 'undefined') ? 'white'   : pColor;
        pStyle = (typeof pStyle === 'undefined') ? 'default' : pStyle;
        
        if (typeof pX === 'undefined')
	{
            if (this.uniform_coordinates == true)
            {
		pX = 0;
            }
            else
            {
                pX = this._width / 2;
            }
	}
	if (typeof pY === 'undefined')
	{
            if (this.uniform_coordinates == true)
            {
		pY = 0;
            }
            else
            {
		pY = this._height / 2;
            }	
	}
		
	var s = 4;
	var h = 2;
		
	if (pStyle.indexOf('large') != -1)
	{
            s = 16;
	}
	else if ((pStyle.indexOf('medium') != -1) || (pStyle == 'default'))
	{
            s = 8;
	}
	else if (pStyle.indexOf('small') != -1)
	{
            s = 4;
	}
	else
	{
            osweb.debug.addError('Unknown style: ' + pStyle);
	}	
		
	if ((pStyle.indexOf('open') != -1) || (pStyle == 'default'))
	{	
            this.ellipse(pX - s, pY - s, 2 * s, 2 * s, 1, pColor, 1);
            this.ellipse(pX - h, pY - h, 2 * h, 2 * h, 1, 'black', 1);
	}
	else if (pStyle.indexOf('filled') != -1)
	{	
            this.ellipse(pX - s, pY - s, 2 * s, 2 * s, 1, pColor, 1);
	}
        else if (pStyle.indexOf('cross') != -1)
	{
            this.line(pX, pY - s, pX, pY + s);
            this.line(pX - s, pY, pX + s, pY);
	}
	else
	{
            osweb.debug.addError('Unknown style: ' + pStyle);
	}	
    };

    p.gabor = function(pX, pY, pOrient, pFreq, pEnv, pSize, pStdev, pPhase, pColor1, pColor2, pBgmode)
    {
	console.log('Not available yet: canvas.gabor');
    };

    p.height = function()
    {
    	return this._heigth();
    };

    p.image = function(pFName, pCenter, pX, pY, pScale)
    {
	// Set the class private properties. 
	var image         = new createjs.Bitmap();
        image.image       = pFName.data;
	image.scaleX      = pScale;
        image.scaleY      = pScale;
        image.snapToPixel = true;
        image.x		  = pX - ((image.image.width  * pScale) / 2);
    	image.y           = pY - ((image.image.height * pScale) / 2);
	
	// Add the text item to the parten frame.
	this._container.addChild(image);
    };
	
    p.init_display = function(pExperiment)
    {
	// Set the dimension properties.
	this._height = pExperiment.vars.height;
    	this._width  = pExperiment.vars.width;
	
	// Initialize the display dimensions.
	osweb.runner._canvas.height = pExperiment.vars.height;
	osweb.runner._canvas.width  = pExperiment.vars.width;
		
	// Initialize the display color.
	osweb.runner._canvas.style.background = pExperiment.vars.background;

        // Set focus to the experiment canvas.
        osweb.runner._canvas.focus(); 
    };

    p.line = function(pSx, pSy, pEx, pEy, pColor, pPenWidth)
    {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	shape.graphics.moveTo(pSx, pSy);
	shape.graphics.lineTo(pEx, pEy); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.noise_patch = function(pX, pY, pEnv, pSize, pStdev, pColor1, pColor2, pBgmode)
    {
    	console.log('Not available yet: canvas.noise_patch');
    };
	
    p.polygon = function()
    {
    	console.log('Not available yet: canvas.polygon');
    };
	
    p.prepare = function()
    {
    	console.log('N/A: canvas.prepare');
    };
	
    p.rect = function(pX, pY, pW, pH, pFill, pColor, pPenWidth)
    {
    	var shape = new createjs.Shape();
	shape.graphics.setStrokeStyle(pPenWidth);
	shape.graphics.beginStroke(pColor);
	if (pFill == 1)
	{
            shape.graphics.beginFill(pColor);
	}
	shape.graphics.rect(pX, pY, pW, pH); 

	// Add the line item to container..
	this._container.addChild(shape); 
    };
	
    p.set_font = function(pFamily, pSize, pItalic, pBold, pUnderline)
    {
   	// Define the the font styles.
    	var font_bold      = (pBold      == true) ? 'bold '      : '';
        var font_italic    = (pItalic    == true) ? 'italic '    : '';
        var font_underline = (pUnderline == true) ? 'underline ' : '';
        
        // Set the font string.
        this._font_string = font_bold + font_italic + font_underline + pSize + 'px ' + pFamily; 
     };
        
    p.show = function()
    {
    	// Add the container to the stage object and update the stage.
	osweb.runner._stage.addChild(this._container);
	osweb.runner._stage.update(); 

	// Return the current time.
	if (this.experiment != null)
        {
            return this.experiment.clock.time();
        }    
        else
        {    
            return null;
        }
    };
	
    p.size = function()
    {
    	// Create object tuple.
    	var size = {width: this._width, height: this._height};
	return size;
    };
	
    p.text = function(pText, pCenter, pX, pY , pColor, pHtml)
    {
	// Create the text element.          
	var text = new createjs.Text(pText, this._font_string, pColor);

	// Set the text element properties.
	text.x = pX - (text.getMeasuredWidth() / 2);
	text.y = pY - (text.getMeasuredHeight() / 2);
		 
	// Add the text item to the parten frame.
	this._container.addChild(text);
    };

    p.text_size = function(pText, pMax_width, pStyle_args)
    {
    };

    // Bind the canvas class to the osweb namespace.
    osweb.canvas = canvas;
}());

/*
 * Definition of the class clock.
 */

(function() 
{
    function clock(pExperiment)
    {
        // Define and set the private properties. 
        this._startTime = this._now();
		
        // Set the class public properties. 
	this.experiment = pExperiment;
    }; 
	
    // Extend the class from its base class.
    var p = clock.prototype;
    
    // Define the class public properties. 
    p.experiment = null;

    /*
     * Definition of class private methods.   
     */
    
    p._now = function() 
    {
	// Get the current time stamp using the best available timing method.
	if (window.performance.now) 
	{
            return Math.round(window.performance.now());
	} 
	else if (window.performance.webkitNow) 
	{
            return Math.round(window.performance.webkitNow());
	} 
	else 
	{
            return new Date().getTime();
	}
    };

    /*
     * Definition of public class methods.   
     */

    p.initialize = function()
    {
        // Set the absolute start time of the expeirment.
        this._startTime = this._now();
    };

    p.sleep = function(pMs) 
    {
        // Sleeps (pauses) for a period.
	if (this.experiment !=  null)
	{
            // Set the event processor.
            osweb.events._run(this, pMs, osweb.constants.RESPONSE_DURATION, null);
	}
    };
	
    p.time = function() 
    {
        // Gives a current timestamp in milliseconds. 
        if (this._startTime != -1)
        {
            return (this._now() - this._startTime);
        }    
        else
        {
            return 0;
        }    
    };
 	
    // Bind the clock class to the osweb namespace.
    osweb.clock = clock;
}());

/*
 * Definition of the class keyboard.
 */

(function() 
{
    function keyboard(pExperiment, pTimeout, pKeylist)
    {
        // Set the public properties. 
	this.experiment = pExperiment;
	this.keylist    = (typeof pKeylist === 'undefined') ? []   : pKeylist;	
	this.timeout    = (typeof pTimeout === 'undefined') ? null : pTimeout;
	
        // Set the private properties. 
        this._response     = null;
	this._synoniem_map = null;
        
        // Define the key conversion list.
        this._define_synoniem_map();
    }; 
	
    // Extend the class from its base class.
    var p = keyboard.prototype;
    
    // Define the public properties. 
    p.experiment = null;
    p.keylist 	 = [];
    p.timeout    = null;
	
    /*
     * Definition of class private methods.
     */

    p._define_synoniem_map = function()
    {
        // Define the map with synoniems.
        this._synoniem_map = [[' ','space','SPACE'],['"','quotedbl','QUOTEDBL'],['!','exclaim','EXCLAIM'],['#','hash','HASH'],
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
    };

    p._get_default_from_synoniem = function(pResponses)
    {
        var defaults = [];
        for (var i = 0;i < pResponses.length;i++)
        {
            var synoniem = this.synonyms(pResponses[i]);
            defaults.push(synoniem[0]);
        }

        return defaults;    
    };
    
    p._set_response = function(pKeyboardResponse)
    {
	// Set the last response item.
	this._response = pKeyboardResponse;		
    };

    /*
     * Definition of class public methods.
     */

    p.default_config = function()
    {
        // Return the default configuration.
	return {'timeout': null, 
                'keylist': null};
    };
    
    p.flush = function() 
    {
	// Clear all pending keyboard input, not limited to the keyboard.
        osweb.debug.addMessage('OsWeb warning: the method keyboard.flush() is not implemented in the current version of OsWeb.');
    };
 	
    p.get_key = function(pTimeout, pKeylist) 
    {
	// Collects a single key press.
	this.keylist = (typeof pKeylist === 'undefined') ? this.keylist : pKeylist;	
	this.timeout = (typeof pTimeout === 'undefined') ? this.timeout : pTimeout;
		
	if (this.experiment != null)
	{
            // Set the event processor.
            osweb.events._run(this, this.timeout, osweb.constants.RESPONSE_KEYBOARD, this.keylist);
	};
    };

    p.get_mods = function()
    {
    	// Returns a list of keyboard moderators (e.g., shift, alt, etc.) that are currently pressed.
        osweb.debug.addMessage('OsWeb warning: the method keyboard.get_mods() is not implemented in the current version of OsWeb.');
    };

    p.set_config = function(pTimeout, pKeylist)
    {
	// Set the properties.
	this.keylist = pKeylist;	
	this.timeout = pTimeout;
    };
	
    p.show_virtual_keyboard = function(pVisible)
    {
        // Shows or hides a virtual keyboard.		
    	if (pVisivle == true)
	{
            // Hack to show the virutal keyboard. ## Must be tested!
            osweb.runner._canvas.setfocus();
	}
	else
	{
            // Hack to hide the virtual keyboard. ## Must be tested!
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
	}
    };

    p.synonyms = function(pButton)
    {
        if (typeof pButton !== 'undefined')
        {
            for (var i = 0;i < this._synoniem_map.length;i++)
            {
                for (var j = 0;j < this._synoniem_map[i].length;j++)
                {
                    if (this._synoniem_map[i][j] == pButton)
                    {
                        return this._synoniem_map[i];
                        break;
                    }
                }   
            }
        }
        else
        {
            return null;
        }    
    };

    // Bind the keyboard class to the osweb namespace.
    osweb.keyboard = keyboard;
}());
/*
 * Definition of the class log.
 */

(function() 
{
    function log(pExperiment, pPath)
    {
    	// Define and set the private properties. 
	this._all_vars       = null;
	this._header_written = false;	
	this._log            = [];
	this._path           = '';

        // set the class properties. 
	this.experiment              = pExperiment;
	this.experiment.vars.logfile = pPath;
    }; 
	
    // Extend the class from its base class.
    var p = log.prototype;
    
    // Set the class default properties. 
    p.experiment = null;
	
    /*
     * Definition of public class methods.   
     */

    p.all_vars = function()
    {
	// Retrieves a list of all variables that exist in the experiment.
	if (this._all_vars == null)
	{
            this._all_vars = this.experiment.vars.inspect();
	}
		
	return this._all_vars;
    };

    p.close = function()
    {
	// Closes the current log.
	if (this._log.length > 0) 
	{
            console.log(this._log.join(''));
	}

	// Clear the log file.
	this._log = [];
    };

    p.flush = function()
    {
    	// Flush the log file.
        this._log = [];
    };

    p.open = function(pPath)
    {	
	// Opens the current log. If a log was already open, it is closed.
	this._header_written = false;
	this._path           = pPath; 
	
	// Check for old data.
	if (this._log != null)
	{
            // Clear the old data.
            this.close();
	}
    };

    p.write = function(pMsg, pNewline)
    {
    	// Write one message to the log.
	pNewline = (typeof pNewline === 'undefined') ? true : pNewline;
	
	// Write a new line.
	if (pNewline == true)
	{
            this._log.push(pMsg + '\n');
	}
	else
	{
            // Write the Message line.
            this._log.push(pMsg);
	}
    };

    p.write_vars = function(pVar_list)
    {
    	// Writes variables to the log.
	pVar_list = (typeof pVar_list === 'undefined') ? null : pVar_list;
		
	var value, variable; 
	var l = [];
			
	if (pVar_list == null)
	{
            pVar_list = this.all_vars();
	}
		
	if (this._header_written == false)
	{
            for (var i=0; i < pVar_list.length; i++)
            {
		l.push('"' + pVar_list[i] + '"');
            }		
            this.write(l.join());
            this._header_written = true;
	}
		
	l = [];
	for (var i=0; i < pVar_list.length; i++)
	{
            value = this.experiment.vars.get(pVar_list[i],'NA',false);
            l.push('"' + value + '"');
	}
	this.write(l.join());
    };
 	
    // Bind the log class to the osweb namespace.
    osweb.log = log;
}());

/*
 * Definition of the class mouse.
 */

(function() 
{
    function mouse(pExperiment, pTimeout, pButtonlist, pVisible)
    {
        // Set the class public properties. 
	this.experiment = pExperiment;
	this.timeout    = (typeof pTimeout === 'undefined')    ? null : pTimeout;
	this.buttonlist = (typeof pButtonlist === 'undefined') ? null : pButtonlist;	
	this.visible    = (typeof pVisible === 'undefined')    ? true : pVisible;	

	// Set the class private properties. 
	this._response     = null;
        this._synoniem_map = null;

        // Define the key conversion list.
        this._define_synoniem_map();
    }; 
	
    // Extend the class from its base class.
    var p = mouse.prototype;
    
    // Define the class public properties. 
    p.experiment = null;
    p.buttonlist = [];
    p.timeout    = -1;
    p.visible 	 = false;
	
    /*
     * Definition of class private methods.
     */

    p._define_synoniem_map = function()
    {
        // Define the map with synoniems.
        this._synoniem_map = [['1','left_button'], ['2','middle_button'], ['3','right_button'], ['4','scroll_up'], ['5','scroll_down']];
    };        

    p._get_default_from_synoniem = function(pResponses)
    {
        var defaults = [];
        for (var i = 0;i < pResponses.length;i++)
        {
            var synoniem = this.synonyms(pResponses[i]);
            defaults.push(synoniem[0]);
        }

        return defaults;    
    };

    p._set_response = function(pMouseResponse)
    {
    	// Set the last response item.
    	this._response = pMouseResponse;		
    };

    /*
     * Definition of class public methods.
     */
    
    p.default_config = function()
    {
        // Return the default configuration.
        return {'timeout'   : -1,
		'buttonlist': null,
		'visible'   : false};
    };

    p.flush = function() 
    {
	// Clears all pending mouse input, not limited to the mouse.
        osweb.debug.addMessage('OsWeb warning: the method mouse.flush() is not implemented in the current version of OsWeb.');
    };
 	
    p.get_click = function(pTimeout, pButtonlist, pVisible)
    {
	// Collects a single mouse click.
	this.timeout    = (typeof pTimeout === 'undefined')    ? this.timeout    : pTimeout;
	this.buttonlist = (typeof pButtonlist === 'undefined') ? this.buttonlist : pButtonlist;	
	this.visible    = (typeof pVisible === 'undefined')    ? this.visible    : pVisible;	

	if (this.experiment != null)
	{
            // Hide or show the mouse.
            this.show_cursor(this.visible);
	
            // Set the event processor.
            osweb.events._run(this, this.timeout, osweb.constants.RESPONSE_MOUSE, this.buttonlist);
	};
    };

    p.get_pos = function()
    {
    	// check if there is a mouse move event available.
        if (osweb.events._mouse_move !== null)
        {
            return {'rtTime': osweb.events._mouse_move.rtTime, 'x': osweb.events._mouse_move.event.clientX, 'y': osweb.events._mouse_move.event.clientY};
        }
        else
        {
            return {'rtTime': -1, 'x': -1, 'y': -1};
        }    
    };

    p.get_pressed = function()
    {
    	// Returns the current state of the mouse buttons. A True value means the button is currently being pressed.
        osweb.debug.addMessage('OsWeb warning: the method mouse.get_pressed() is not implemented in the current version of OsWeb.');
     };

    p.set_config = function(pTimeout, pButtonlist, pVisible)
    {
	// Set mouse properties.          
	this.timeout    = pTimeout;
	this.buttonlist = pButtonlist;	
	this.visible    = pVisible;	
    };

    p.set_pos = function(pPos)
    {
    	// Returns the current position of the cursor.	
        osweb.debug.addMessage('OsWeb warning: the method mouse.set_pos() is not implemented in the current version of OsWeb.');
    };

    p.show_cursor = function(pVisible)
    {
    	// Set the property
	this.visible = pVisible;
		
	// Immediately changes the visibility of the mouse cursor.	
	if (pVisible == true)
	{
            // Show the mouse cursor.
            osweb.runner._stage.canvas.style.cursor = "default";
	}
	else
	{
            // Set the cursor visibility to none.
            osweb.runner._stage.canvas.style.cursor = "none";
        }
    };

    p.synonyms = function(pButton)
    {
        if (typeof pButton !== 'undefined')
        {
            for (var i = 0;i < this._synoniem_map.length;i++)
            {
                for (var j = 0;j < this._synoniem_map[i].length;j++)
                {
                    if (this._synoniem_map[i][j] == pButton)
                    {
                        return this._synoniem_map[i];
                        break;
                    }
                }   
            }
        }
        else
        {
            return null;
        }    
    };

    // Bind the mouse class to the osweb namespace.
    osweb.mouse = mouse;
}()); 

/*
 * Definition of the class sampler.
 */

(function() 
{
    function sampler(pExperiment, pSrc, PVolume, pPitch, pPan, pDuration, pFade, pBlock)
    {
      	// Set the class public properties. 
	this.experiment = pExperiment;
	
	// Check if optional parameters are defined.
	this.block    = (typeof pBlock    === 'undefined') ? false   : pBlock;	
	this.duration = (typeof pDuration === 'undefined') ? 'sound' : pDuration;	
	this.fade     = (typeof pFade     === 'undefined') ? 0       : pFade;	
	this.pan      = (typeof pPan      === 'undefined') ? 0       : pPan;	
	this.pitch    = (typeof pPitch    === 'undefined') ? 1       : pPitch;	
	this.src      = (typeof pSrc      === 'undefined') ? ''      : pSrc;	
	this.volume   = (typeof pVolume   === 'undefined') ? 1       : pVolume;	

	// Create the sound instance
	if (pSrc != null)
	{
            // Set the sound object.
            this._instance = pSrc.data;
		
            // Set the event anchor for 
            this._instance.on("ended", osweb.events._audioEnded.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = sampler.prototype;
    
    // Define the public properties. 
    p.duration = 'sound';	
    p.block    = false;
    p.fade     = '0';
    p.pan      = '0';
    p.pitch    = '1';
    p.src      = null;
    p.volume   = 1;
    
    /*
     * Definition of class public methods.
     */

    p.play = function(PVolume, pPitch, pPan, pDuration, pFade, pBlock)
    {
	// Check if optional parameters are defined.
	this.block    = (typeof pBlock    === 'undefined') ? this.block    : pBlock;	
	this.duration = (typeof pDuration === 'undefined') ? this.duration : pDuration;	
	this.fade     = (typeof pFade     === 'undefined') ? this.fade     : pFade;	
	this.pan      = (typeof pPan      === 'undefined') ? this.pan      : pPan;	
	this.pitch    = (typeof pPitch    === 'undefined') ? this.pitch    : pPitch;	
	this.volume   = (typeof pVolume   === 'undefined') ? this.volume   : pVolume;	

	// Set the sound properties.
	this._instance.volume = this.volume;
		
	// Play the actual sound.
	this._instance.play();	
    };

    p.wait = function()
    {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_SOUND,[]);
    };
    
    // Bind the sampler class to the osweb namespace.
    osweb.sampler_backend = sampler;
}());

/*
 * Definition of the class video.
 */

(function() 
{
    function video(pExperiment, pSrc)
    {
      	// Set the class public properties. 
	this.experiment = pExperiment;
	
	// Create the sound instance
	if (pSrc != null)
	{
            // Set the sound object.
            this._ctx   = osweb.runner._canvas.getContext('2d');
            this._video = pSrc.data;
            
            // Set the event anchor for 
            this._video.on("ended"     , osweb.events._videoEnded.bind(this));
            this._video.on("timeupdate", osweb.events._videoUpdate.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = video.prototype;
    
    // Define the public properties. 
    p.duration = 'video';	
    
    /*
     * Definition of class public methods.
     */
    
    p.play = function()
    {
	// Play the actual video.
        this._video.play();	
    };

    p.stop = function()
    {
	// Pause the actual sound.
	this._video.pause();	
    };

    p.wait = function()
    {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_VIDEO,[]);
    };
    
    // Bind the video class to the osweb namespace.
    osweb.video_backend = video;
}());
