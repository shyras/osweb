/*
 * OSweb 
 *  
 * An experiment research tool written in Javascript and HTML to be used in 
 * Qualtrics or other web-based tools. 
 *
 * Author: drs. J. Bos
 *
 * Copyright (c) University of Groningen 
 * Faculty of Behavioural and Social Sciences
 * Technical Support Service 
 *
 */

// Use strict mode.     
"use strict";

// Set osweb namespace.
this.osweb = this.osweb||{};

/*
 * Definition of osweb version constants. 
 */

osweb.VERSION_NAME   = 'osweb';
osweb.VERSION_NUMBER = '0.035 (21-06-2016)';

/*
 * Definition of osweb class utility methods.
 */

osweb.extendClass = function(pSubClass, pSuperClass) 
{
    function o() { this.constructor = pSubClass; }
    o.prototype = pSuperClass.prototype;
    return (pSubClass.prototype = new o());
}; 

osweb.isClass = function(pClassName)
{
    // Return true if the classname is defined within the osweb namespace.
    return (this[pClassName] !== undefined);
};

osweb.newItemClass = function(pType, pExperiment, pName, pString)
{
    // Create the element.
    var element = new this[pType](pExperiment, pName, pString);
   
    // Set the type of the item.
    element.type = pType;
    
    // Return the element
    return element;
};

osweb.newElementClass = function(pType, pSketchpad, pString)
{
    // Create the element.
    var element = new this[pType](pSketchpad, pString);
    
    // Return the element
    return element;
};

osweb.newWidgetClass = function(pType, pForm, pVariables)
{
    // Create the element.
    var widget = new this[pType](pForm, pVariables);
   	
    // Return the element
    return widget;
}; 

osweb.promoteClass = function(pSubClass, pPrefix) 
{
    var subP = pSubClass.prototype, supP = (Object.getPrototypeOf&&Object.getPrototypeOf(subP))||subP.__proto__;
    if (supP) 
    {
    	subP[(pPrefix+="_") + "constructor"] = supP.constructor; 
    	for (var n in supP) 
    	{
            if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) { subP[pPrefix + n] = supP[n]; }
	}
    }
    return pSubClass;
}; 

/*
 * Definition of the class constants.
 */

(function() 
{
    function constants() 
    {
    	throw "The class constants cannot be instantiated!";
    }

    /*
     * Definition of error constants. 
     */

    constants.ERROR_001 = 'osweb has stopped running due a fatal error.';
    constants.ERROR_002 = 'No content parameter specified.';
    constants.ERROR_003 = 'No context parameter specified.';
    constants.ERROR_004 = 'Invalid scriptID or scriptURL for retrieving script from external location.';
    constants.ERROR_005 = 'Failure to retrieve script from external location (Ajax call error).';
    constants.ERROR_006 = 'Failure to retrieve script from external location (database response error)';
    constants.ERROR_007 = 'Failure to retrieve script from external location (database retrieve error).';
    constants.ERROR_008 = 'Invalid script definition, parsing error.';
    constants.ERROR_009 = 'Unknown class definition within osweb script - ';

    /*
     * Definition of message constants. 
     */

    constants.MESSAGE_001 = 'OS';
    constants.MESSAGE_002 = 'web - version ';
    constants.MESSAGE_003 = 'Start up osweb experiment session.';
    constants.MESSAGE_004 = 'Retrieving stimuli files.';
    constants.MESSAGE_005 = 'Retrieving input parameters.';
    constants.MESSAGE_006 = 'Press with the mouse on this screen to continue.';

    /*
     * Definition of general constants. 
     */
 	               
    // Set the class default constants.
    constants.STATUS_NONE          = 0;
    constants.STATUS_BUILD         = 1;
    constants.STATUS_INITIALIZE    = 2;
    constants.STATUS_EXECUTE       = 3;
    constants.STATUS_FINALIZE      = 4;

    // Set the class default constants.
    constants.PARSER_NONE          = 0;
    constants.PARSER_EXECUTE       = 1;
    constants.STATUS_PENDING       = 2;
    constants.STATUS_DONE          = 3;

    // Constant definitions (collectionMode)
    constants.PRESSES_ONLY         = 1;
    constants.RELEASES_ONLY        = 2;
    constants.PRESSES_AND_RELEASES = 3;

    // Constant definitions (collectionMode)
    constants.RESPONSE_NONE         = 0;
    constants.RESPONSE_DURATION     = 1;
    constants.RESPONSE_KEYBOARD     = 2;
    constants.RESPONSE_MOUSE        = 3;
    constants.RESPONSE_SOUND        = 4;
    constants.RESPONSE_AUTOKEYBOARD = 5;
    constants.RESPONSE_AUTOMOUSE    = 6;
    
    // Constant definitions (system update)
    constants.UPDATE_NONE          = 0;
    constants.UPDATE_ONSET         = 1;
    constants.UPDATE_OFFSET        = 2;

    // Define the class public contants properties.
    constants.SEQUENTIAL           = 0;
    constants.RANDOM               = 1;
    constants.RANDOMREPLACEMENT    = 2;

    // Bind the constants class to the osweb namespace.
    osweb.constants = constants;
}()); 

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

        // Set the cursor visibility to none (default).
        osweb.runner._canvas.style.cursor = 'none';

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
    	if (pVisible == true)
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
        console.log('?');
        console.log(this._log);
        
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

        // Sort the var list.
        pVar_list.sort();
        
	if (this._header_written == false)
	{
            for (var i=0; i < pVar_list.length; i++)
            {
		//l.push('"' + pVar_list[i] + '"');
		l.push(pVar_list[i]);
            }		
            this.write(l.join());
            this._header_written = true;
	}
		
	l = [];
	for (var i=0; i < pVar_list.length; i++)
	{
            value = this.experiment.vars.get(pVar_list[i], 'NA', false);
            //l.push('"' + value + '"');
            l.push(value);
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

/*
 * Definition of the class debug.
 */

(function() 
{
    function debug() 
    {
    	throw "The class debug cannot be instantiated!";
    }

    // Definition of public properties.
    debug.enabled    = true;
    debug.error      = false;
    debug.messageLog = new Array();

    /*
     * Definition of class methods.               
     */

    debug._initialize = function()
    {
    	// Clear the log.
    	this.messageLog = [];
    };	

    debug._finalize = function()
    {
	// If enabled add the log to the javascript console.
	if (this.enabled == true)
	{
            console.log(this.messageLog);			
	}

	// Clear the log.
	this.messageLog = [];
    };

    /*
     * Definition of the public methods.               
     */

    debug.addError = function(pErrorText)
    {
    	// Set the error flag.
    	this.error = true;

        // Show the fatal error warning.
	console.log(pErrorText);
	console.log(osweb.constants.ERROR_001);

	// throw the exception.
	throw new Error(pErrorText);	
    };
	
    debug.addMessage = function(pMessageText)
    {
        // Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    debug.msg = function(pMessageText)
    {
	// Push the error message to the log.
	this.messageLog.push(pMessageText);		
	
	if (debug.enabled == true)
	{
            console.log(pMessageText);
        }    
    };

    // Bind the debug class to the osweb namespace.
    osweb.debug = debug;
}());

/*
 * Definition of the class file_pool_store.
 */

(function() 
{
    function file_pool_store()
    {
    	throw "The class file_pool_store cannot be instantiated!";
    }; 
	
    // Definition of private class properties.
    file_pool_store._data  = [];
    file_pool_store._items = [];  
	
    /*
     * Definition of private class methods.   
     */

    file_pool_store.add_from_local_source = function(pItem)
    {
        var ext = pItem.filename.substr(pItem.filename.lastIndexOf('.') + 1);
        
        if ((ext == 'jpg') || (ext == 'png'))
	{
            // Create a new file pool mage item.
            var img = new Image();
            img.src = pItem.toDataURL();
            var item = {data: img, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'image'};
	}
        else if ((ext == 'wav') || (ext == 'ogg'))
	{
            var ado = new Audio();
            ado.src = pItem.toDataURL();
            var item = {data: ado, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'sound'};
	}
	else if (ext == 'ogv')
        {
            var ado = document.createElement("VIDEO");
            ado.src = pItem.toDataURL();
            var item = {data: ado, folder: pItem.filename, name: pItem.filename.replace(/^.*[\\\/]/, ''), size: pItem.length, type: 'video'};
        }    
        
	// Add the item to the pool.
	this._items.push(item);

	// Link the item as property
	this[item.name] = item;
    };

    file_pool_store.add_from_server_source = function(pPath, pFiles)
    {
        console.log('--');
        console.log(pFiles);

        // Check if there are stimuli files.
        if (pFiles.length > 0)
	{
            // Set the preloader.
            this._queue = new createjs.LoadQueue(false);
            createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);  // need this so it doesn't default to Web Audio
            this._queue.installPlugin(createjs.Sound);
 		
            this._queue.on("fileload", this._file_complete, this);
            this._queue.on("complete", this._load_complete, this);

            // Add the stimuli information to the loader.
            for (var i=0;i < pFiles.length;i++)
            {
                var re = /(?:\.([^.]+))?$/;
                var extention = re.exec(pFiles[i]);
                console.log(extention);
                
                if (extention[0] == '.ogg')
                {
                    console.log('sound');
                    this._queue.loadFile({id: pFiles[i], src: pPath + pFiles[i], type: createjs.AbstractLoader.SOUND});
                }    
                else
                { 
                    this._queue.loadFile({id: pFiles[i], src: pPath + pFiles[i], type: createjs.AbstractLoader.IMAGE});
                }        
            }
	
            // Load the stimuli files.
            this._queue.load();
        }
        else
        {
            // Build the experiment objects using the given script.
            osweb.runner._buildExperiment();
        } 
    }; 
    
    file_pool_store._file_complete = function(pEvent)
    {
	// Update the loader text.
	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_007);

        // Push the stimulus item to the stimuli object.
        var item = {data: pEvent.result, folder: pEvent.item.id, name: pEvent.item.id.replace(/^.*[\\\/]/, ''), size: pEvent.item.id, type: 'image'};
        
        // Add the item to the pool.
	this._items.push(item);

	// Link the item as property
	this[item.name] = item;
    };	
	
    file_pool_store._load_complete = function()
    {
	// Update the loader text.
	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_006);

        console.log(this._items);

	// Building is done, go to next phase.
        osweb.runner._buildExperiment();
    };	

    /*
     * Definition of public class methods.   
     */

    file_pool_store.add = function(pPath, pNew_Name)
    {
    	// Copies a file to the file pool. 
    };
	
    file_pool_store.fallback_folder = function()
    {	
    	// The full path to the fallback pool folder.
    };
	
    file_pool_store.files = function()
    {
    	// Returns all files in the file pool.
    };

    file_pool_store.folder = function()
    {
    	// The full path to the (main) pool folder.
    };
	
    file_pool_store.folders = function()
    {
    	// Gives a list of all folders that are searched when retrieving the full path to a file. 
    };

    file_pool_store.in_folder = function(pPath)
    {
    	// Checks whether path is in the pool folder. 
    };

    file_pool_store.rename = function(pOld_path, pNew_path)
    {
	// Renames a file in the pool folder.
    };
	
    file_pool_store.size = function()
    {
	// The combined size in bytes of all files in the file pool.
    };

    // Bind the stack file_pole_store to the osweb namespace.
    osweb.pool = file_pool_store;
}());

/*
 * Definition of the class functions.
 */

(function() 
{
    function functions() 
    {
	throw "The class functions cannot be instantiated!";
    }

    /*
     * Definition of general function methods.   
     */

    functions._initialize = function()
    {
	window['print']		 = this.print;
	window['randint']        = this.randint;
        
	// Create the global function calls for use in the inlide script item.
	window['canvas']         = this.canvas;
	window['copy_sketchpad'] = this.copy_sketchpad;
	window['keyboard']       = this.keyboard;
	window['mouse']          = this.mouse;
	window['pause']          = this.pause;
	window['reset_feedback'] = this.reset_feedback;	
	window['sampler']        = this.sampler;
	window['set_response']   = this.set_response;
	window['set_subject_nr'] = this.set_subject_nr;	
	window['sometimes']      = this.sometimes;
	window['synth'] 	 = this.synth;
	window['xy_circle'] 	 = this.xy_circle;
	window['xy_distance'] 	 = this.xy_distance;
	window['xy_from_polar']  = this.xy_from_polar;
	window['xy_grid'] 	 = this.xy_grid;
	window['xy_random'] 	 = this.xy_random;
	window['xy_to_polar']    = this.xy_to_polar;
    };
		
    /*
     * Definition of general function methods.   
     */

    functions.print = function(pString)
    {
	console.log('print output:' + pString);
    };

    functions.randint = function(pStart, pEnd)
    {
        var multiplier = pEnd - pStart;
        var rand = Math.floor(Math.random() * multiplier);
        return rand + pStart;
    };

    /*
     * Definition of general function methods.   
     */

    functions.canvas = function(pAuto_prepare, pStyle_args)
    {
        console.log('warning: function "canvas" not available yet.');
    };

    functions.copy_sketchpad = function(pName)
    {
        console.log('warning: function "copy_sketchpad" not available yet.');
    };

    functions.keyboard = function(pResp_args)
    {
        console.log('warning: function "keyboard" not available yet.');
    };

    functions.mouse = function(pResp_args)
    {
        console.log('warning: function "mouse" not available yet.');
    };

    functions.pause = function()
    {
        console.log('warning: function "pause" not available yet.');
    };

    functions.reset_feedback = function()
    {
        console.log('warning: function "reset_feedback" not available yet.');
    };

    functions.sampler = function(pSrc, pPlayback_args)
    {
        console.log('warning: function "sampler" not available yet.');
    };

    functions.set_response = function(pResponse, pResponse_time, pCorrect)
    {
        console.log('warning: function "set_response" not available yet.');
    };
	
    functions.set_subject_nr = function(pNr)
    {
        console.log('warning: function "set_subject_nr" not available yet.');
    };

    functions.sometimes = function(pP)
    {
        console.log('warning: function "sometimes" not available yet.');
    };

    functions.synth = function(pOsc, pFreq, pLength, pAttack, pDecay)
    {
        console.log('warning: function "synth" not available yet.');
    };

    functions.xy_circle = function(pN, pRho, pPhi0, pPole)
    {
        console.log('warning: function "xy_circle" not available yet.');
    };

    functions.xy_distance = function(pX1, pY1, pX2, pY2)
    {
        console.log('warning: function "xy_distance" not available yet.');
    };

    functions.xy_from_polar = function(pRho, pPhi, pPole)
    {
        console.log('warning: function "xy_from_polar" not available yet.');
    };

    functions.xy_grid = function(pN, pSpacing, pPole)
    {
        console.log('warning: function "xy_grid" not available yet.');
    };

    functions.xy_random = function(pN, pWidth, pHeight, pMin_dist, pPole)
    {
        console.log('warning: function "xy_random" not available yet.');
    };

    functions.xy_to_polar = function(pX, pY, pPole)
    {
        console.log('warning: function "xy_to_polar" not available yet.');
    };

    // Bind the functions class to the osweb namespace.
    osweb.functions = functions;
}()); 

/*
 * Definition of the class heartbeat.
 */

(function() 
{
    function heartbeat(pExperiment, pInterval)
    {
        // Set the class public properties. 
    	this.experiment = pExperiment;
	this.interval   = (typeof pInterval === 'undefined') ? 1 : pInterval;	
    }; 
	
    // Extend the class from its base class.
    var p = heartbeat.prototype;
    
    // Define the class public properties. 
    p.experiment = null;
    p.interval   = -1;

    /*
     * Definition of class private methods.   
     */

    p.beat = function()
    {
    };

    p.run = function()
    {
    };

    p.start = function()
    {
    };
	
    // Bind the heartbeat class to the osweb namespace.
    osweb.heartbeat = heartbeat;
}());

/*
 * Definition of the class item_stack.
 */

(function() 
{
    function item_stack()
    {
   	throw "The class item_stack cannot be instantiated!";
    }; 
	
    // Definition of private class properties.
    item_stack._items = [];  
	
    /*
     * Definition of public class methods.   
     */

    item_stack.clear = function()
    {
    	// Clears the stack.
	this._items = [];
    };

    item_stack.push = function(pItem, pPhase)
    {
    	// Create the stack item.
	var StackItem = {'item': pItem, 'phase': pPhase};

	// Push the item onto the stack.
	this._items.push(StackItem);
    };	

    item_stack.pop = function()
    {
	// Pops the last item from the stack.
	return this._items.pop();
    };

    // Bind the item_stack class to the osweb namespace.
    osweb.item_stack = item_stack;
}());

/*
 * Definition of the class item_store.
 */

(function() 
{
    function item_store()
    {
	throw "The class item_store cannot be instantiated!";
    } 
		
    // Set the class private properties. 
    item_store._experiment = null;
    item_store._items      = {};
    
    /*
     * Definition of public methods - running item.         
     */
    
    item_store.execute = function(pName, pParent)
    {
	// Executes the run and prepare phases of an item, and updates the item stack.
	this.prepare(pName);
	this.run(pName, pParent);
    };

    item_store.items = function()
    {
	// Create a list o keys.
        var items = [];
        for (var key in this._items) 
        {
            items.push([key ,this._items[key]]);
        }    
        
        // Returns a list of item names.
	return items;
    };

    item_store.keys = function()
    {
	// Create a list o keys.
        var keys = [];
        for (var key in this._items) 
        {
            keys.push(key);
        }    
        
        // Returns a list of item names.
	return keys;
    };

    item_store.new = function(pType, pName, pScript)
    {
	// Check if the element is part of the osweb name space
	if (osweb.isClass(pType) == true)
	{
            // Add the new item as property of items.
            this._items[pName] = osweb.newItemClass(pType, this._experiment, pName, pScript);
        }
	else
	{
            // Unkwone class definition, show error message.
            osweb.debug.addError(osweb.constants.ERROR_009 + pType);
	}
    };
    
    item_store.prepare = function(pName, pParent)
    {
        // Executes the prepare phase of an item, and updates the item stack.
	osweb.item_stack.push(pName, 'prepare');
        
        this._items[pName]._parent = pParent;
        this._items[pName].prepare();
    };	

    item_store.run = function(pName, pParent)
    {
	// Set the current and its parent item.
	osweb.events._current_item         = this._items[pName];
	osweb.events._current_item._parent = pParent;
		
	// Executes the run phase of an item, and updates the item stack.
	osweb.item_stack.push(pName, 'run');
	this._items[pName].run();
    };

    item_store.valid_name = function(pItem_type, pSuggestion)
    {
        // Check the optional parameters.
        pSuggestion = (typeof pSuggestion === 'undefined') ? null : pSuggestion;
        
        if (pSuggestion == null)
        {
            var name = 'new_' + pItem_type;
        }
        else
        {
            var name = this._experiment.syntax.sanitize(pSuggestion, true, false);
        }   
        
        // Create a unique name.
        var i     = 1;
        var _name = name;
        while (this._items.hasOwnProperty(_name) == true)
        {
            _name = name + '_' + String(i);
	    i++;
        } 

        // Return function result
        return _name; 
    };    
    
    item_store.values = function()
    {
  	// Create a list o keys.
        var values = [];
        for (var key in this._items) 
        {
            values.push(this._items[key]);
        }    
        
        // Returns a list of item names.
	return values;
    };

    // Bind the item_store class to the osweb namespace.
    osweb.item_store = item_store;
}());

/*
 * Definition of the class prng.
 */

(function() 
{
    function prng()
    {
    	throw "The class prng cannot be instantiated!";
    }; 
	
    // Set the class private properties. 
    prng._previous = 0;
    prng._prng     = uheprng();    
    prng._seed     = '0';

    /*
     * Definition of class methods - run cycle.   
     */
    
    prng._initialize = function()
    {
        // Create the random seed. 
        this._prng.initState();
        this._prng.hashString(this._seed); 
    };

    /*
     * Definition of class methods.   
     */

    prng._getNext = function() 
    {
        // Get the next random number.
        this._previous = (this._prng(1000000000000000) / 1000000000000000);
        
        // Return function result.
        return this._previous;
	};

    prng._getPrevious = function() 
    {
        // Return function result.
        return this._previous;
    };

    prng._getSeed = function() 
    {
        // Return the current seed value.
        return this._seed;        
    };

    prng._random = function(pMin, pMax) 
    {
        // Calculate the range devider.
        var devider = (1 / ((pMax - pMin) + 1));
         
        // Get the random number and devide it.
        this._previous = ((this._prng(1000000000000000) / 1000000000000000));
        
        // Set the devider.
        this._previous = pMin + Math.floor(this._previous / devider);
               
        // Return function result. 
        return this._previous;
    };

    prng._reset = function() 
    {
        // Set the random seed value to 0. 
        this._seed = '0';

        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(String(this._seed));
    };
    
    prng._setSeed = function(pSeed) 
    {
        // Set the random seed value. 
        this._seed = String(pSeed);
        
        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(this._seed);
    };

    // Bind the prng class to the osweb namespace.
    osweb.prng = prng;
}());

/*
 * Definition of the class python_workspace.
 */

(function() 
{
    function python_workspace()
    {
    	throw "The class python_workspace cannot be instantiated!";
    }; 
	
    /*
     * Definition of public class methods.   
     */
    
    python_workspace._eval = function(pBytecode)
    {
        // Check wich type of expression must be evaled.
        if (typeof pBytecode === 'boolean')    
        {
            return pBytecode;
        }
        else if (typeof pBytecode === 'string')
        {
            // Open sesame script, first check for paramter values. 
            pBytecode = osweb.syntax.eval_text(pBytecode);

            // Evaluate the expression.
            return eval(osweb.syntax.remove_quotes(pBytecode));    
        }
        else
        {
            console.log('>python script - not supported yet');
            return eval(pBytecode);
        }    
    };
	
    python_workspace.init_globals = function()
    {
    };
	
    // Bind the python_workspace class to the osweb namespace.
    osweb.python_workspace = python_workspace;
}());
 
/*
 * Definition of the class syntax.
 */

(function() 
{
    function syntax()
    {
    	throw "The class syntax cannot be instantiated!";
    }; 

    /*
     * Definition of private class methods.   
     */

    syntax._convertPython = function(pScript)
    {
    	return pScript;
    };

    syntax.isNumber = function(n)
    {
        return Number(n) == n;
    };

    syntax.isFloat = function(n)
    {
        return Number(n) === n && n % 1 !== 0;
    };

    syntax.remove_quotes = function(pString)
    {
	if ((pString[0] == '"') && (pString[pString.length - 1] == '"'))
	{
            return pString.slice(1, pString.length - 1);
	}
	else
	{
            return pString;
	}	
    };

    /*
     * Definition of public class methods.   
     */
    
    syntax.compile_cond = function(pCnd, pBytecode)
    {
	// Check for conditional paramters.
	pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;	
		
	if (pCnd == 'always')
	{
            return true;
	} 
	else if (pCnd == 'never')
	{
            return false;
	} 
        else
	{
            if (pCnd.substring(0,1) == '=')
            {
                // Python script, compile it to an ast tree.
                console.log('python script is not supported yet');
            } 
            else
            {
                // opensesame script, convert it to javascript.
                pCnd = pCnd.replace(/[^(!=)][=]/g, '==');
            }
        }    

        return pCnd;
    };
	
    syntax.eval_text = function(pTxt, pVars, pRound_float, pVar)
    {
	// Evaluates variables and inline Python in a text string.
	var result     = pTxt;
	var processing = result.search(/[^[\]]+(?=])/g);
		
	while (processing != -1)
	{
            // Replace the found value with the variable.
            var variable = result.slice(processing,result.indexOf(']'));
           
            if (typeof pVars === 'undefined')
            {
                var value = osweb.runner.experiment.vars[variable];
            }
            else
            {
                var value = pVars[variable];
            } 
            
            result	 = result.replace('[' + variable + ']',value);			
            processing   = result.search(/[^[\]]+(?=])/g);
        }

        return result;
    };

    syntax.parse_cmd = function(pString)
    {
	// split the astring.
	var tokens = this.split(pString);
	tokens.shift();
	tokens.shift();
	return tokens;
    };

    syntax.sanitize = function(pString, pStrict, pAllowVars)
    {
	// Removes invalid characters (notably quotes) from the string.
	return pString;
    };

    syntax.split = function(pLine)
    {
    	// Return an array with tokens ignoring whitespaces within. 
	var result = pLine.match(/(?:[^\s"]+|"[^"]*")+/g);
        
        return (result != null) ? result : [];
    };    

    // Bind the syntax class to the osweb namespace.
    osweb.syntax = syntax;
}());

/*
 * Definition of the class var_store.
 */

(function() 
{
    function var_store(pItem, pParent)
    {
        // Set the class properties. 
        this._item   = pItem;
        this._parent = pParent;
    }; 
	
    // Extend the class from its base class.
    var p = var_store.prototype;
    
    // Set the class default properties. 
    p._item   = null;
    p._parent = null;        
	
    /*
     * Definition of public class methods.   
     */

    p.get = function(pVar, pDefault, pEval, pValid)
    {
	// Set the optional arguments
	pDefault = (typeof pDefault === 'undefined') ? null : pDefault;
	pEval    = (typeof pEval === 'undefined')    ? true : pEval;
	pValid   = (typeof pValid === 'undefined')   ? null : pValid;
		
	var value = null;

	// Gets an experimental variable.
	if (pVar in this)
	{
            if (typeof this[pVar] == 'string')
            {
	 	value = osweb.syntax.eval_text(this[pVar]);
            }
            else
            {
 		value = this[pVar];
            }
 	}

	// Return function result.
	return value;
    };

    p.inspect = function()
    {
	var keys = [];
	for(var key in this)
  	{
            keys.push(key);
   	}
   		
   	// Slide default properties. 
   	keys = keys.slice(2,keys.length - 3);
   		
	return keys;
    };

    p.set = function(pVar, pVal)
    {
	// Sets and experimental variable.
	this[pVar] = pVal;
    };
	
    // Bind the vars class to the osweb namespace.
    osweb.var_store = var_store;
}());
	
/*
 * Definition of the class item.
 */

(function() 
{
    function item(pExperiment, pName, pScript)
    {
	// Set the class private properties.
	this._get_lock = null;
	this._parent   = null;
	this._status   = osweb.constants.STATUS_NONE;

        // Set the class public properties.
	this.count      = 0;	
	this.debug	= osweb.debug.enabled;
	this.experiment = (pExperiment == null) ? this : pExperiment;
	this.name       = pName;	
	this.vars 	= (this.vars) ? this.vars : new osweb.var_store(this, null);

        // Set the object realted properties.
	this.clock            = this.experiment._clock;		
	this.log              = this.experiment._log;
	this.python_workspace = this.experiment._python_workspace;	
        this.syntax           = this.experiment._syntax; 	
	
        // Read the item definition string.	
	this.from_string(pScript);
    } 
	
    // Extend the class from its base class.
    var p = item.prototype;

    // Definition of class public properties. 
    p.clock            = null;
    p.comments         = null;
    p.count            = 0;
    p.debug            = false;
    p.experiment       = null;
    p.log              = null;
    p.name             = '';
    p.syntax           = null;
    p.python_workspace = null;
    p.vars             = null;
    p.variables        = null;

    /*
     * Definition of public methods - general function.
     */

    p.dummy = function()
    {
    	// Dummy function, continue execution of an item directly.
    };
   
    p.resolution = function()
    {
    	/* // Returns the display resolution and checks whether the resolution is valid.
        var w = this.vars.get('width');
	var h = this.vars.get('height');
	if ((typeof w !== 'number') || (typeof h !== 'number'))
	{
            osweb.debug.addError('(' + String(w) + ',' + String(h) + ') is not a valid resolution');
        }
        
        return [w, h]; */
    };
   
    p.set_response = function(pResponse, pResponse_time, pCorrect)
    {
	// Processes a response in such a way that feedback variables are updated as well.
        console.log('warning: method "item.set_response" not implemented yet.');
    };
 
    p.sleep = function(pMs)
    {
	// Pauses the object execution. !WARNING This function can not be implemented due the script blocking of javascript.
	this.clock.sleep(pMs);
    };

    p.time = function()
    {
	// Returns the current time.
    	return this.clock.time();
    };

     /*
     * Definition of public methods - build cycle.         
     */

    p.from_string = function(pString)
    {
	// Parses the item from a definition string.
	osweb.debug.addMessage('');
        this.variables = {};
	this.reset();
	this.comments = [];
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                   
                    this.parse_line(lines[i]);
                }
            }
	}					
    };
	
    p.parse_comment = function(pLine)
    {
	// Parses comments from a single definition line, indicated by # // or '.
	pLine = pLine.trim();
	if ((pLine.length > 0) && (pLine.charAt(0) == '#'))
	{
            // Add comments to the array removing the first character.
            this.comments.push(pLine.slice(1));

            return true;
	}	
	else if ((pLine.length > 1) && (pLine.charAt(0) == '/'))
	{
            // Add comments to the array removing the first two characters.
            this.comments.push(pLine.slice(2));
            
            return true;			
	}
	else
	{
            return false;
	}
    };	
	
    p.parse_keyword = function(pLine, pFrom_ascii, pEval)
    {
    };

    p.parse_line = function(pLine)
    {
	// Allows for arbitrary line parsing, for item-specific requirements.
    };

    p.parse_variable = function(pLine)
    {
        // Reads a single variable from a single definition line.
        if (this.parse_comment(pLine))
        {
            return true;
        }
        else
        {
            var tokens = osweb.syntax.split(pLine);
            if ((tokens != null) && (tokens.length > 0) && (tokens[0] == 'set'))
            {
		if (tokens.length != 3)
		{
                    osweb.debug.addError('Error parsing variable definition: ' + pLine);
		}	
            	else
		{
                    // Rettrieve the value of the variable, remove additional quotes.
                    var value = osweb.syntax.remove_quotes(tokens[2]);
                    // Check for number types.
                    value = osweb.syntax.isNumber(value) ? Number(value) : value;
                    
                    this.vars.set(tokens[1], value);
                    return true;
		}
            }
            else
            {
		return false;
            }
        }	
    };
	
    /*
     * Definition of public methods - runn cycle. 
     */
    
    p.reset = function()
    {
	// Resets all item variables to their default value.
    };

    p.prepare = function()
    {
	// Implements the prepare phase of the item.
	this.experiment.vars.set('count_' + this.name, this.count);
	this.count++;
		
	// Set the status to initialize.
	this._status = osweb.constants.STATUS_INITIALIZE;
    	
        // For debugging.
        osweb.debug.addMessage('prepare' + this.name);
        
        // Implements the complete phase of the item (to support blocking script in the prepare phase).
	if ((this._parent !== null) && (this.type !== 'feedback'))
	{
            // Prepare cycle of parent.
            this._parent.prepare_complete();
        }
    };

    p.prepare_complete = function()
    {
        // Dummy function for completion process.
        console.log('prepare complete' + this.name);
    };

    p.set_item_onset = function(pTime)
    {
 	// Set a timestamp for the item's executions
	var time = (pTime != null) ? pTime : this.clock.time();
	this.experiment.vars.set('time_' + this.name, time);
    };	

    p.run = function()
    {
    	// Implements the run phase of the item.
        osweb.debug.addMessage('run' + this.name);
    };

    p.update = function()
    {
    	// Implements the update phase of the item.
    };
    
    p.update_response = function(pResponse)
    {
	// Implements the update_response phase of an item.
    };	

    p.complete = function()
    {
    	// Implements the complete phase of the item.
	if (this._parent !== null)
	{
            // Return the process control to the parent of the element.
            osweb.events._current_item = this._parent;
            osweb.events._current_item.run();  
	}
    };
  
    // Bind the item class to the osweb namespace.
    osweb.item = item;
}());

/*
 * Definition of the class generic_response.
 */

(function() 
{
    function generic_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
	// Definition of private properties.
	this._allowed_responses = null;
	this._duration          = 0;
	this._duration_func 	= null;
	this._keyboard		= null;
	this._mouse             = null;
	this._responsetype	= osweb.constants.RESPONSE_NONE;
	this._timeout           = -1;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(generic_response, osweb.item);

    // Definition of public properties.
    p.auto_response    = "a";
    p.process_feedback = false;
    p.synonyms         = null;
  
    /*
     * Definition of public methods - build cycle. 
     */

    p.auto_responser = function()
    {
    };

    p.auto_responser_mouse = function()
    {
    };

    p.prepare_allowed_responses = function()
    {
        // Prepare the allowed responses..
        if (this.vars.get('allowed_responses') == null)
	{
            this._allowed_responses = null;
	}
	else
	{	
            // Create a list of allowed responses that are separated by semicolons. Also trim any whitespace.
            var allowed_responses = String(this.vars.allowed_responses).split(';');
            
            if (this.vars.duration == 'keypress')
            {	
		//this._allowed_responses = allowed_responses;
                this._allowed_responses = this._keyboard._get_default_from_synoniem(allowed_responses);
            }
            else if (this.vars.duration == 'mouseclick')
            {
                // For mouse responses, we don't check if the allowed responses make sense.
            	this._allowed_responses = this._mouse._get_default_from_synoniem(allowed_responses);
            }
            
            // If allowed responses are provided, the list should not be empty.
            if (this._allowed_responses.length == 0)
            {
		osweb.debug.addError(this.vars.get('allowed_responses') + ' are not valid allowed responses in keyboard_response '+ this.name);	
            } 
	}
    };
		
    p.prepare_duration = function()
    {
	// Prepare the duration.
	if (this.vars.get('duration') != null)
	{
            if (typeof this.vars.duration == 'number')
            {
		// Prepare a duration in milliseconds
		this._duration = this.vars.duration;
		if (this._duration == 0)
		{
                    this._responsetype = osweb.constants.RESPONSE_NONE;
		}
		else
		{	
                    this._responsetype = osweb.constants.RESPONSE_DURATION;
		}
            }
            else
            {
		this._duration = -1;
		if (this.vars.duration == 'keypress')
		{
                    this.prepare_duration_keypress();
                    this._responsetype = osweb.constants.RESPONSE_KEYBOARD;
		}
		else if (this.vars.duration == 'mouseclick')
		{
                    this.prepare_duration_mouseclick();
                    this._responsetype = osweb.constants.RESPONSE_MOUSE;
		}
                else if (this.vars.duration == 'sound')
                {
                    this._responsetype = osweb.constants.RESPONSE_SOUND;
                } 
                else if (this.vars.duration == 'video')
                {
                    this._responsetype = osweb.constants.RESPONSE_VIDEO;
                } 
            }		
	}
    };
	
    p.prepare_duration_keypress = function()
    {
        // Prepare a keyboard duration.
	this._keyboard = new osweb.keyboard(this.experiment);
	if (this.experiment.auto_response == true)
	{
            this._duration_func = this.auto_responder;
	}
	else
	{
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._keyboard.set_config(final_duration, this._allowed_responses);
	}
    };
	
    p.prepare_duration_mouseclick = function(self)
    {
	// Prepare a mouseclick duration.
	this._mouse = new osweb.mouse(this.experiment);
	if (this.experiment.auto_response == true)
	{
            this._duration_func = this.auto_responder_mouse;
	}
	else
	{
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._mouse.set_config(final_duration, this._allowed_responses, false);
	}
    };	

    p.prepare_timeout = function()
    {
	// Prepare the timeout.
	if (this.vars.get('timeout') != null) 
	{
            if (typeof this.vars.timeout == 'number')
            {
		// Prepare a duration in milliseconds
            	this._timeout = this.vars.timeout;
            }
            else
            {
		this._timeout = -1;
            }		
	}
    };	
    
    /*
     * Definition of public methods - run cycle. 
     */

    p.process_response_keypress = function(pRetval)
    {
	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response            = this.syntax.sanitize(pRetval.resp);
	this.synonyms                            = this._keyboard.synonyms(this.experiment.vars.response); 
	this.response_bookkeeping();
    };
	
    p.process_response_mouseclick = function(pRetval)
    {
 	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response		 = pRetval.resp;
	this.synonyms                            = this._mouse.synonyms(this.experiment.vars.response);
	this.experiment.vars.cursor_x            = pRetval.event.clientX;
	this.experiment.vars.cursor_y            = pRetval.event.clientY;
	this.response_bookkeeping();
    };

    p.response_bookkeeping = function()
    {
	// The respone and response_time variables are always set, for every response item
	this.experiment.vars.set('response_time', this.experiment._end_response_interval - this.experiment._start_response_interval);
	this.experiment.vars.set('response_' + this.name, this.experiment.vars.get('response'));
	this.experiment.vars.set('response_time_' + this.name, this.experiment.vars.get('response_time'));
	this.experiment._start_response_interval = null;

	// But correctness information is only set for dedicated response items, such as keyboard_response items, because otherwise we might confound the feedback
	if (this.process_feedback == true)
	{
            // debug.msg(u"processing feedback for '%s'" % self.name)
            if (this.vars.correct_response != null)
            {
                // If a correct_resbponse has been defined, we use it to determine accuracy etc.
		if (this.synonyms != null)  
		{
                    if (this.synonyms.indexOf(String(this.vars.get('correct_response'))) != -1)
                    { 
                        this.experiment.vars.correct       = 1;
			this.experiment.vars.total_correct = this.experiment.vars.total_correct + 1;
                    }
                    else
                    {
                        this.experiment.vars.correct = 0;
                    }
		}	
		else
		{
                    this.experiment.vars.correct = 'undefined';
                    /* if self.experiment.response in (correct_response, safe_decode(correct_response)):
                    	self.experiment.var.correct = 1
			self.experiment.var.total_correct += 1
                    else:
                    	self.experiment.var.correct = 0 */
		}
            }
            else
            {
                // If a correct_response hasn't been defined, we simply set correct to undefined.
		this.experiment.vars.correct = 'undefined';
            }	

            // Do some response bookkeeping
            this.experiment.vars.total_response_time   = this.experiment.vars.total_response_time + this.experiment.vars.response_time;
            this.experiment.vars.total_responses       = this.experiment.vars.total_responses + 1;
            this.experiment.vars.accuracy              = Math.round(100.0 * this.experiment.vars.total_correct / this.experiment.vars.total_responses);
            this.experiment.vars.acc        	       = this.experiment.vars.accuracy;
            this.experiment.vars.average_response_time = Math.round(this.experiment.vars.total_response_time / this.experiment.vars.total_responses);
            this.experiment.vars.avg_rt                = this.experiment.vars.average_response_time;
            this.experiment.vars.set('correct_' + this.name, this.vars.correct); 
	} 
   };	
	
   p.process_response = function()
   {
   	// Start stimulus response cycle.
   	switch (this._responsetype)
   	{
            case osweb.constants.RESPONSE_NONE:
 		// Duration is 0, so complete the stimulus/response cycle.
 		this._status = osweb.constants.STATUS_FINALIZE;
                this.complete();
           
            break;
            case osweb.constants.RESPONSE_DURATION:
		this.sleep_for_duration();
            
            break;
            case osweb.constants.RESPONSE_KEYBOARD:
                this._keyboard.get_key();
            
            break;
            case osweb.constants.RESPONSE_MOUSE:
                this._mouse.get_click();
            
            break;
            case osweb.constants.RESPONSE_SOUND:
               this._sampler.wait();

            break;
            case osweb.constants.RESPONSE_VIDEO:
               this._video.wait();
            
            break;
   	}		
    };

    p.set_sri = function(pReset)
    {
	// Sets the start of the response interval.
	if (pReset == true)
	{
            this.sri = self.vars.get('time_' + this.name);
            this.experiment._start_response_interval = this.vars.get('time_' + this.name);
	}
	
	if (this.experiment._start_response_interval == null)
	{
            this.sri = this.experiment.vars.get('time_' + this.name);
	}
	else
	{
            this.sri = this.experiment._start_response_interval;
	}
    };		

    p.sleep_for_duration = function()
    {
	// Sleep for a specified time.
	this.sleep(this._duration);		
    };
   
    /*
     * Definition of public methods - running item. 
     */
    
    p.prepare = function()
    {
	// Implements the prepare phase of the item.
	this.prepare_timeout();
	this.prepare_allowed_responses();
	this.prepare_duration();
    
        // Inherited.	
	this.item_prepare();
    };
    
    p.update = function(pResponse)
    {
        // Implements the update response phase of the item.
	if ((this._responsetype == osweb.constants.RESPONSE_KEYBOARD) && (pResponse.type == osweb.constants.RESPONSE_KEYBOARD)) 
	{
            this.process_response_keypress(pResponse);
	}
	else if ((this._responsetype == osweb.constants.RESPONSE_MOUSE) && (pResponse.type == osweb.constants.RESPONSE_MOUSE)) 
	{
            this.process_response_mouseclick(pResponse);     
	}
    }; 

    // Bind the generic_response class to the osweb namespace.
    osweb.generic_response = osweb.promoteClass(generic_response, "item");
}());

/*
 * Definition of the class experiment.
 */

(function() 
{
    function experiment(pExperiment, pName, pScript, pPool_folder, pExperiment_path, pFullscreen, pAuto_response, pLogfile, pSubject_nr, pWorkspace, pResources, pHeartbeat_interval)
    {
	// Set the items property for this experiment.
	osweb.item_store._experiment = this;

	// Set the optional arguments
	pLogfile = (typeof pLogfile === 'undefined') ? null : pLogfile;

	// Set the private properties. 
	this._end_response_interval   = null;
	this._start_response_interval = null;
	this._syntax                  = osweb.syntax;
	this._python_workspace        = (pWorkspace) ? pWorkspace : osweb.python_workspace;

	// Set the public properties. 
	this.auto_response      = (pAuto_response) ? pAuto_response : false;
	this.cleanup_functions  = [];
	this.heartbeat_interval = (pHeartbeat_interval) ? pHeartbeat_interval : 1;
	this.items              = osweb.item_store;
	this.output_channel 	= null;
	this.paused 		= false;
	this.plugin_folder 	= 'plugins';
	this.pool               = osweb.file_pool_store;
	this.resources 		= (pResources) ? pResources : {};
	this.restart 		= false;
	this.running		= false;
	this.vars               = new osweb.var_store(this, null);
		
	// Set default variables
	this.vars.start               = 'experiment';
	this.vars.title               = 'My Experiment';
	this.vars.bidi                = 'no';
	this.vars.round_decimals      = 2;
	this.vars.form_clicks         = 'no';
	this.vars.uniform_coordinates = 'no';

        // Sound parameters.
	this.vars.sound_freq          = 48000;
	this.vars.sound_sample_size   = -16; 
	this.vars.sound_channels      = 2;
	this.vars.sound_buf_size      = 1024;

	// Default backend
	this.vars.canvas_backend      = 'xpyriment';

	// Display parameters.
	this.vars.width               = 1024;
	this.vars.height              = 768;
	this.vars.background          = 'black';
	this.vars.foreground          = 'white';
	this.vars.fullscreen          = (pFullscreen) ? 'yes' : 'no';

	// Font parameters.
	this.vars.font_size           = 18;
	this.vars.font_family         = 'mono';
	this.vars.font_italic         = 'no';
	this.vars.font_bold 	      = 'no';
	this.vars.font_underline      = 'no'; 

	// Logfile parameters
	this.logfile = pLogfile;
	this.debug   = osweb.debug.enabled;

	// Create the backend objects.
	this._canvas = new osweb.canvas(this);
	this._clock  = new osweb.clock(this);
	this._log    = new osweb.log(this, this.logfile);
	
        // Set the global anchors.
        window['clock'] = this._clock;
        window['log']   = this._log;    
        
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(experiment, osweb.item);
  
    // Definition of public properties. 
    p.auto_response      = false;
    p.cleanup_functions  = [];
    p.heartbeat_interval = 1;
    p.items              = null;
    p.output_channel     = null;
    p.paused             = false;
    p.plugin_folder      = '';
    p.pool               = null;
    p.resources          = null;
    p.restart            = false;
    p.running            = false;
  	
    /*
     * Definition of public methods - general function.
     */

    p.item_prefix = function()
    {
	// A prefix for the plug-in classes, so that [prefix][plugin] class is used instead of the [plugin] class.
	return '';		
    };

    p.reset_feedback = function()
    {
	// Resets the feedback variables (acc, avg_rt, etc.)."""
	this.vars.total_responses       = 0;
	this.vars.total_correct         = 0;
	this.vars.total_response_time   = 0;
	this.vars.avg_rt                = 'undefined';
	this.vars.average_response_time = 'undefined';
	this.vars.accuracy              = 'undefined';
	this.vars.acc                   = 'undefined';
    };

    p.set_subject = function(pNr)
    {
	// Sets the subject number and parity (even/ odd). This function is called automatically when an experiment is started, so you do not generally need to call it yourself.
	this.vars.subject_nr = pNr;
	if ((pNr % 2) == 0)
	{
            this.vars.subject_parity = 'even';
	}
	else
	{
            this.vars.subject_parity = 'odd';
	}
    };
  
    /*
     * Definition of public methods - building item.         
     */

    p.read_definition = function(pString)
    {
    	// Extracts a the definition of a single item from the string.
	var line = pString.shift();
	var def_str = '';
    	while ((line != null) && (line.length > 0) && (line.charAt(0) == '\t'))
	{
            def_str = def_str + line + '\n';
            line = pString.shift();
	}	
	return def_str;
    };	

    p.from_string = function(pString)
    {
    	// Set debug message.
	osweb.debug.addMessage('building experiment');
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            this._source = pString.split('\n');
            var l = this._source.shift();
            while (l != null)
            {
		// Set the processing of the next line.
		var get_next = true;

                try
		{
                    // Split the single line into a set of tokens.
                    var t = osweb.syntax.split(l);					
		}
		catch(e)
		{
                    // u"Failed to parse script. Maybe it contains illegal characters or unclosed quotes?", \
		}	

		if ((t != null) && (t.length > 0))
		{
                    // Try to parse the line as variable (or comment)
                    if (this.parse_variable(l) == false)
                    {
                        if (t[0] == 'define') 
			{
                            if (t.length == 3)
                            {
				// Get the type, name and definition string of an item.
				var item_type = t[1];
                                var item_name = osweb.syntax.sanitize(t[2]);
				var def_str = this.read_definition(this._source);
					
				osweb.item_store.new(item_type, item_name, def_str); 
                            }
                            else
                            {
                                // raise osexception(u'Failed to parse definition',line=line);
                            }
			}
                    }
		}

		// Get the next line.
		if (get_next == true)
		{
                    l = this._source.shift();
		}
            }
	};
    };
    
    /*
     * Definition of public methods - backends.
     */

    p.init_clock = function()
    {
	// Initializes the clock backend.
	this._clock.initialize;
    };	

    p.init_display = function()
    {
	// Initializes the canvas backend.
	this._canvas.init_display(this);

        this._python_workspace['win'] = window;
    };

    p.init_heartbeat = function()
    {
	// Initializes heartbeat.
	if ((this.heartbeat_interval <= 0) || (this.vars.fullscreen == 'yes') || (this.output_channel == null))
	{
            this.heartbeat = null;
	}
	else
	{
            this.heartbeat = new osweb.heartbeat(this, 1); 	
            this.heartbeat.start();
	}
    };	

    p.init_log = function()
    {
    	// Open a connection to the log file.
	this._log.open(this.logfile); 	
    };

    p.init_random = function()
    {
	// Initializes the random number generators. For some reason
	/* import random
	random.seed()
	try:
            # Don't assume that numpy is available
            import numpy
            numpy.random.seed()
            except:
            pass */
    };

    p.init_sound = function()
    {
	// Intializes the sound backend.
	/* from openexp import sampler
	sampler.init_sound(self) */
    };

    /*
     * Definition of public methods - running item.         
     */

    p.run = function()
    {
	// Inherited.	
	this.item_run();
	
	// Runs the experiment.
        switch (this._status)
        {
            case osweb.constants.STATUS_INITIALIZE:

                // Set the status to finalize.
		this._status = osweb.constants.STATUS_FINALIZE;

		// Save the date and time, and the version of OpenSesame
		this.vars.datetime            = new Date().toString();
		this.vars.opensesame_version  = osweb.VERSION_NUMBER; 
		this.vars.opensesame_codename = osweb.VERSION_NAME; 
		this.running = true;
		this.init_random();
		this.init_display();
		this.init_clock();
		this.init_sound();
		this.init_log();
		this.python_workspace.init_globals();
		this.reset_feedback();
		this.init_heartbeat(); 
	
		// Add closing message to debug system.
		osweb.debug.addMessage('experiment.run(): experiment started at ' + new Date().toUTCString()); 

		if (osweb.item_store._items[this.vars.start] != null)
		{
                    osweb.item_stack.clear();
                    osweb.item_store.prepare(this.vars.start, this);
                    //osweb.item_store.execute(this.vars.start, this);
		}
		else
		{
                    osweb.debug.addError('Could not find item ' + self.vars.start +  ' , which is the entry point of the experiment');
		}

            break;
            case osweb.constants.STATUS_FINALIZE:

		// Add closing message to debug system.
                osweb.debug.addMessage('experiment.run(): experiment finished at ' +  new Date().toUTCString());

		// Complete the run process.
		this.end();
	
            break;
        }; 
    };

    p.end = function()
    {
	this.running = false;
	
	//this._log.flush();
	this._log.close();
		
	// Disable the processing unit.
	osweb.events._current_item = null;
	
	// Clear the exprimental stage and enabled the mouse.
	osweb.runner._canvas.style.cursor = 'default';
        osweb.runner._stage.update(); 
			
	// Finalize the parent (runner).	
    	osweb.runner._finalize();
    };

    // Bind the experiment class to the osweb namespace.
    osweb.experiment = osweb.promoteClass(experiment, "item");
}());

/*
 * Definition of the class inline_script.
 */

(function() 
{
    function inline_script(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
	
	// Define and set the public properties. 
	this._prepare_run  = false;   
        this._prepare_tree = null;
	this._run_tree     = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(inline_script, osweb.item);

    // Define and set the public properties. 
    p.description = 'Executes Python code';

    /*
     * Definition of private methods - compiling script.
     */

    p._compile = function(pScript)
    {
        if (pScript != '')
        {
            var locations = false;
            var parseFn   = filbert_loose.parse_dammit;
            var ranges    = false;
        		
            try 
	    {
        	var code  = pScript;
         	var ast   = parseFn(code, { locations: locations, ranges: ranges });
        
	       	return ast;
    	    }
       	    catch (e) 
            {
        	console.log('error');
        	console.log(e.toString());
    	   	
                return null;
            }
	}
	else
	{
            return null;
        }	   	
    };

    /*
     * Definition of public methods - building item.         
     */
		
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this._var_info     = null;
	this.vars._prepare = '';
	this.vars._run     = '';
    };

    p.from_string = function(pString)
    {
    	// Parses a definition string.
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var read_run_lines     = false;
            var read_prepare_lines = false;
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		var tokens = osweb.syntax.split(lines[i]);
			
		if ((tokens != null) && (tokens.length > 0))
		{
                    switch (tokens[0])
                    {
			case 'set': 
                            this.parse_variable(lines[i]);
                            
                        break;
			case '__end__':
                            read_run_lines     = false;
                            read_prepare_lines = false;
                            
			break;	
			case '___prepare__':
                            read_prepare_lines = true;
                            
			break;
			case '___run__':
                            read_run_lines = true;
                            
			break;
			default:
                            if (read_run_lines == true)
                            {
				this.vars._run = this.vars._run + lines[i] + '\n';
                            }
                            else if (read_prepare_lines == true)
                            {
                            	this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                            }
                    }
		}
		else 
		{
                    if (read_run_lines == true)
                    {
			this.vars._run = this.vars._run + lines[i] + '\n';
                    }
                    else if (read_prepare_lines == true)
                    {
			this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                    }
            	} 
            }
	}
    };

    /*
     * Definition of public methods - running item.         
     */

    p.prepare = function()
    {
	// Compile the script code to ast trees.
        this._prepare_tree = osweb.parser._prepare(this.vars._prepare);
        this._run_tree     = osweb.parser._prepare(this.vars._run);
	
        // Execute the run code.
 	if (this._prepare_tree != null)
    	{
            // Set the current item.
            osweb.events._current_item = this;
            
            // Set the prepare run toggle.
            this._prepare_run = true;
            
            console.log('run');
            // Start the parser
            osweb.parser._run(this, this._prepare_tree);    		
        }
        else
        {
            // Inherited.	
            this.item_prepare();
        }    
    };

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
        
        // Record the onset of the current item.
	this.set_item_onset(); 

        // Execute the run code.
 	if (this._run_tree != null)
    	{
            // Set the prepare run toggle.
            this._prepare_run = false;
            
            // Start the parser
            osweb.parser._run(this, this._run_tree);    		
    	}
    };
    
    p.complete = function()
    {
            console.log('run complete');
        // Check if the parser is ready. 
        if (osweb.parser._status == 1)
        {
            // Set parent node.
            osweb.parser._current_node = osweb.parser._current_node.parent;

            // Set the parser status.
            osweb.parser._process_node();
        }
        else
        {    
            if (this._prepare_run === true)             
            {
                // Inherited prepare.	
                this.item_prepare();
            }    
            else
            { 
                // Inherited.           
                this.item_complete();
            }
        }    
    }; 
	
    // Bind the Sequence class to the osweb namespace.
    osweb.inline_script = osweb.promoteClass(inline_script, "item");
}());

/*
 * Definition of the class keyboard_response.
 */

(function() 
{
    function keyboard_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
	this._flush    = 'yes';
	this._keyboard = new osweb.keyboard(this.experiment); 
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(keyboard_response, osweb.generic_response);

        // Definition of public properties. 
    p.description = 'Collects keyboard responses';
	
    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.auto_response          = 'space';
	this.process_feedback       = true; 
	this.vars.allowed_responses = null;
	this.vars.correct_response  = null;
	this.vars.duration          = 'keypress';
	this.vars.flush             = 'yes';
	this.vars.timeout           = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {	
	// Set the internal flush property.
	this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

    	// Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();

        // Record the onset of the current item.
	this.set_item_onset(); 
	
	// Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush == 'yes')
	{	
            this._keyboard.flush();
	}		
	
        this.set_sri();
	this.process_response();
    };
	
    // Bind the keyboard_response class to the osweb namespace.
    osweb.keyboard_response = osweb.promoteClass(keyboard_response, "generic_response");
}());

/*
 * Definition of the class logger.
 */

(function() 
{
    function logger(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._logvars = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(logger, osweb.item);

    // Definition of public properties. 
    p.description = 'Logs experimental data';
    p.logvars	  = [];
	
    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
        // Resets all item variables to their default value.
	this._logvars      = null;
	this.logvars       = [];
	this.vars.auto_log = 'yes';
    };

    p.from_string = function(pString)
    {
	// Parses a definition string.
	this.variables = {};
	this.comments  = [];
	this.reset();

	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'log') && (tokens.length > 0))
                    {
			this.logvars.push(tokens[1]);
                    }	
		}
            }
        }
    };	

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function()
    {
	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
	{
            // item is finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            this.set_item_onset();
            if (this._logvars == null)
            {
		if (this.vars.auto_log == 'yes')
		{
                    this._logvars = this.experiment._log.all_vars();
		}
		else
		{
                    this._logvars = [];
                    for (variable in this.logvars)
                    {
 			if ((variable in this._logvars) == false)
 			{
                            this._logvars.push(variable);
			}
                    }
                    this._logvars.sort();		
		}
            }
            this.experiment._log.write_vars(this._logvars); 

            // Complete the cycle.
            this.complete();
        };
    };

    p.complete = function()
    {
        // Inherited.	
        this.item_complete();
    };

    // Bind the logger class to the osweb namespace.
    osweb.logger = osweb.promoteClass(logger, "item");
}());

/*
 * Definition of the class loop.
 */

(function() 
{
    function loop(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._break_if = '';
        this._cycles   = [];
        this._index    = -1;
        this._keyboard = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(loop, osweb.item);

    // Definition of public properties. 
    p.description = 'Repeatedly runs another item';
    p.matrix      = null;

    /*
     * Definition of public methods - building cycle.         
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.matrix        = {};
	this.vars.cycles   = 1;
	this.vars.repeat   = 1;
	this.vars.skip     = 0;
	this.vars.offset   = 'no';
	this.vars.order    = 'random';
	this.vars.item     = '';
	this.vars.break_if = 'never';
    };

    p.from_string = function(pString)
    {
    	// Creates a loop from a definition in a string.
    	this.comments  = [];
	this.variables = {};
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'run') && (tokens.length > 1))
                    {
                    	this.vars.item = tokens[1];
                    }	
                    else if ((tokens[0] == 'setcycle') && (tokens.length > 3))
                    {
			var cycle = tokens[1];
			var name  = tokens[2];
			var value = osweb.syntax.remove_quotes(tokens[3]);
					
			// Check if the value is numeric
                        value = osweb.syntax.isNumber(value) ? Number(value) : value;

                        // Convert the python expression to javascript.
			if (value[0] == '=')
			{
                            // Parse the python statement. 
                            value = osweb.parser._prepare(value.slice(1));
                            
                            if (value !== null)        
                            {
                                value = value.body[0];
                            }    
			}

                        if (this.matrix[cycle] == undefined)
			{
                            this.matrix[cycle] = {};
			}
			
                        this.matrix[cycle][name] = value;
                    }	
		}
            }	
	}
    };
  
    /*
     * Definition of public methods - runn cycle.         
     */

    p.shuffle = function(list)
    {
        var i, j, t;
	for (i = 1; i < list.length; i++) 
	{
	    j = Math.floor(Math.random() * (1 + i));  
	    if (j != i) 
	    {
	        t       = list[i];                        
                list[i] = list[j];
	        list[j] = t;
            }
	}			
    };

    p.apply_cycle = function(cycle)
    {
	// Sets all the loop variables according to the cycle.
	if (cycle in this.matrix)
	{
            for (var variable in this.matrix[cycle])
            {
		// Get the value of the variable.
		var value = this.matrix[cycle][variable];

		// Check for python expression.
		if (typeof value === 'object')
                {
                    // value contains ast tree, run the parser.
                    try
                    {	
                        // Evaluate the expression
                        value = osweb.parser._runstatement(value);
                    }
                    catch (e)
                    {
                        // Error during evaluation.
                        osweb.debug.addError('Failed to evaluate ' + value + ' in loop item ' + this.name);
                    }						
                }
				
                // Set the variable.
                this.experiment.vars.set(variable, value);
            }
	}
    };
	
    p.prepare = function()
    {
	// Inherited.	
	this.item_prepare();
	
	// Set the onset time.
	this.set_item_onset();

	// Prepare the break if condition.
	if ((this.vars.break_if != '') && (this.vars.break_if != 'never'))
	{
            this._break_if = this.syntax.compile_cond(this.vars.break_if);
        }
	else
	{
            this._break_if = null;
	}

	//  First generate a list of cycle numbers
	this._cycles = [];
	this._index  = 0;
		
	// Walk through all complete repeats
	var whole_repeats = Math.floor(this.vars.repeat);
	for (var j = 0; j < whole_repeats; j++)
	{
            for (var i = 0; i < this.vars.cycles; i++)
            {
		this._cycles.push(i);
            }
	}
				
	// Add the leftover repeats.
	var partial_repeats = this.vars.repeat - whole_repeats;
	if (partial_repeats > 0)
	{
            var all_cycles = Array.apply(null, {length: this.vars.cycles}).map(Number.call, Number);    
            var remainder  = Math.floor(this.vars.cycles * partial_repeats);
            for (var i = 0; i < remainder; i++)
            {
                // Calculate random position.
                var position = Math.floor(Math.random() * all_cycles.length);     
                // Add position to cycles.
                this._cycles.push(position);
                // Remove position from array.
                all_cycles.splice(position,1);
            }
	}		

	// Randomize the list if necessary.
	if (this.vars.order == 'random')
	{
            this.shuffle(this._cycles);
	}	
	else
	{
            // In sequential order, the offset and the skip are relevant.
            if (this._cycles.length < this.vars.skip)  
            {
		osweb.debug.addError('The value of skip is too high in loop item ' + this.name + '. You cannot skip more cycles than there are.');
            }
            else
            {
		if (this.vars.offset == 'yes')
		{
                    // Get the skip elements.
                    var skip = this._cycles.slice(0, this.vars.skip);
					
                    // Remove the skip elements from the original location.
                    this._cycles = this._cycles.slice(this.vars.skip);

                    // Add the skip element to the end.
                    this._cycles = this._cycles.concat(skip);										
		}
		else
		{
                    this._cycles = this._cycles.slice(this.vars.skip);
		}
            }
	}
		
	// Create a keyboard to flush responses between cycles.
	this._keyboard = new osweb.keyboard(this.experiment);
	
        // Make sure the item to run exists.
	if (this.experiment.items._items[this.vars.item] === 'undefined')
        {
            osweb.debug.addError('Could not find item ' + this.vars.item + ', which is called by loop item ' + this.name);
        }    
    };

    p.run = function()
    {
        // Inherited.	
        this.item_run();

        if (this._cycles.length > 0)
        {
            var exit = false;
            this._index = this._cycles.shift();
            this.apply_cycle(this._index);
		
            if (this._break_if != null)
            {
                this.python_workspace['this'] = this;
                
                var break_if = osweb.syntax.eval_text(this._break_if); 
                
                if (this.python_workspace._eval(break_if) == true)
                {
                    exit = true;
                }	
            }
			
            if (exit == false)
            {
		this.experiment.vars.repeat_cycle = 0;
		
                osweb.item_store.prepare(this.vars.item, this);
                //osweb.item_store.execute(this.vars.item, this);
            }
            else
            {
                // Break the loop.
                this.complete();
            }
        }
        else
        {
            // Break the loop.
            this.complete();
        }
    };	

    p.complete = function()
    {
        // Check if if the cycle must be repeated.
	if (this.experiment.vars.repeat_cycle == 1)
	{
            osweb.debug.msg('repeating cycle ' + this._index);
			
            this._cycles.push(this._index);
            
            if (this.vars.order == 'random')
            {
		this.shuffle(this._cycles);
            }
    	}
        else
        {
            // All items are processed, set the status to finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            // Inherited.	
            this.item_complete();
        }    
    };

    // Bind the loop class to the osweb namespace.
    osweb.loop = osweb.promoteClass(loop, "item");
}());

/*
 * Definition of the class mouse_response.
 */

(function() 
{
    function mouse_response(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
	this._flush = 'yes';
	this._mouse = new osweb.mouse(this.experiment);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(mouse_response, osweb.generic_response);

    // Definition of public properties. 
    p.description = 'Collects mouse responses';
    p.resp_codes  = {};
	
    /*
     * Definition of public methods - build cycle.
     */
	
    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.auto_response          = 1;
	this.process_feedback       = true;
	this.resp_codes             = {};
	this.resp_codes['0']        = 'timeout';
	this.resp_codes['1']        = 'left_button';
	this.resp_codes['2']        = 'middle_button';
	this.resp_codes['3']        = 'right_button';
	this.resp_codes['4']        = 'scroll_up';
	this.resp_codes['5']        = 'scroll_down';
	this.vars.allowed_responses = null;
	this.vars.correct_response  = null;
	this.vars.duration          = 'mouseclick';
	this.vars.flush             = 'yes';
	this.vars.show_cursor       = 'yes';
	this.vars.timeout           = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {	
	// Set the internal flush property.
	this._flush = (this.vars.flush) ? this.vars.flush : 'yes';
 
        // Inherited.	
	this.generic_response_prepare();
   };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();

        // Record the onset of the current item.
	this.set_item_onset(); 
        
	// Show the cursor if defined.
        if (this.vars.show_cursor == 'yes')
	{	
            this._mouse.show_cursor(true);
        }

	// Flush responses, to make sure that earlier responses are not carried over.
	if (this._flush == 'yes')
	{	
            this._mouse.flush();
	}		
    
        this.set_sri();
        this.process_response();
    };

    p.complete = function()
    {
        // Hide the mouse cursor.    
        this._mouse.show_cursor(false);
       
        // Inherited.	
        this.generic_response_complete();
    };

    // Bind the mouse_response class to the osweb namespace.
    osweb.mouse_response = osweb.promoteClass(mouse_response, "generic_response");
}());

/*
 * Definition of the class sampler.
 */

(function() 
{
    function sampler(pExperiment, pName, pScript)
    {
	// Inherited.
	this.generic_response_constructor(pExperiment, pName, pScript);

    	// Definition of private properties.
        this._sample  = null;
        this._sampler = null;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sampler, osweb.generic_response);

    // Definition of public properties.
    p.block	  = false;
    p.description = 'Plays a sound file in .wav or .ogg format';
    
    /*
     * Definition of public methods - build cycle. 
     */

    p.reset = function()
    {
	// Resets all item variables to their default value.
	this.block           = false;
	this.vars.sample     = '';
	this.vars.pan        = 0;
	this.vars.pitch      = 1;
	this.vars.fade_in    = 0;
	this.vars.stop_after = 0;
	this.vars.volume     = 1;
	this.vars.duration   = 'sound';
    };

    /*
     * Definition of public methods - run cycle. 
     */

    p.prepare = function()
    {
        // Create the sample
	if (this.vars.sample != '')
	{
            // Retrieve the content from the file pool.
            this._sample         = osweb.pool[this.syntax.eval_text(this.vars.sample)];  
            this._sampler        = new osweb.sampler_backend(this.experiment, this._sample);
            this._sampler.volume = this.vars.volume;
	}
	else
	{
            /* raise osexception(
            u'No sample has been specified in sampler "%s"' % self.name) */
	}
    
        // Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
    	this.set_item_onset();
	this.set_sri();
	this._sampler.play();
	this.process_response();
    };	

    // Bind the sampler class to the osweb namespace.
    osweb.sampler = osweb.promoteClass(sampler, "generic_response");
}());

/*
 * Definition of the class sequence.
 */

(function() 
{
    function sequence(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.item_constructor(pExperiment, pName, pScript);
	
        // Definition of private properties. 
	this._index         = -1;
	this._index_prepare = -1;
        this._items         = null;
        this._keyboard      = null;    
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sequence, osweb.item);

    // Definition of public properties. 
    p.description    = 'Runs a number of items in sequence';
    p.flush_keyboard = 'yes';
    p.items          = null;
	
    /*
     * Definition of public methods - build cycle.         
     */

    p.reset = function()
    {
	// Resets all item variables to their default value..
	this.items               = [];
	this.vars.flush_keyboard = 'yes';
    };

    p.from_string = function(pString)
    {
	// Parses a definition string.
	this.variables = {};
	this.comments  = [];
	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'run'))
                    {
                        var item = tokens[1];
			var cond = 'always';
			if (tokens.length > 2)
			{
                            cond = tokens[2];
			}	

			// Push the item and condition definition to the items list.
			this.items.push({'item': item, 'cond': cond});
                    }	
            	} 
            }
	}					
    };

    /*
     * Definition of public methods - run cycle.         
     */

    p.prepare = function()
    {
	// Inherited.	
	this.item_prepare();
	
        // Create a keyboard to flush responses at the start of the run phase
	if (this.vars.flush_keyboard == 'yes')
        {	
            this._keyboard = new osweb.keyboard(this.experiment);
        }
        else
        {    
            this._keyboard = null;
        }    
	
        // Generate the items list for the run cycle.
        this._index = 0;
	this._items = [];
        
        // Prepare the items.
        this.prepare_complete();
        
                /* this._items = [];
	for (var i=0; i < this.items.length; i++)
	{
            if ((this.items[i].item in osweb.item_store._items) === false)
            {
		osweb.debug.addError('Could not find item ' + this.items[i].item.name + ' which is called by sequence item ' + this.name);
            }
            else 
            {
                // Prepare the items.
                osweb.item_store.prepare(this.items[i].item);
		
                // Add the item to the internal list.
                this._items.push({'item': this.items[i].item, 'cond': osweb.syntax.compile_cond(this.items[i].cond)});
            }
	} */	
    };
    
    p.prepare_complete = function()
    {
        // Generate the items list for the run cycle.
        if (this._index < this.items.length)
        {
            if ((this.items[this._index].item in osweb.item_store._items) === false)
            {
		osweb.debug.addError('Could not find item ' + this.items[this._index].item.name + ' which is called by sequence item ' + this.name);
            }
            else 
            {
                // Increase the current index.
                this._index++;
                
                // Add the item to the internal list.
                this._items.push({'item': this.items[this._index - 1].item, 'cond': osweb.syntax.compile_cond(this.items[this._index - 1].cond)});
                
                // Prepare the item.
                osweb.item_store.prepare(this.items[this._index - 1].item, this);
	    }
        }
        else
        {
            // Prepare process is done, start execution.
            this._index = 0;
            
            // Remove the prepare phase form the stack.    
            osweb.item_stack.pop();
    
  	    // Execute the next cycle of the sequnce itself.
            osweb.item_store.run(this.name, this._parent);
        }    
    };
    
    p.run = function()
    {
        // Inherited.	
        this.item_run();

        // Check if all items have been processed.
        if (this._index < this._items.length)
        {
            // Flush the keyboard at the beginning of the sequence.
            if ((this._index == 0) && (this.vars.flush_keyboard == 'yes'))
            {
                this._keyboard.flush();
            }

            // Increase the current index.
            this._index++;

            // Set the workspace.
            osweb.python_workspace['self'] = this;

            // Check if the item may run.                            
            if (osweb.python_workspace._eval(this._items[this._index - 1].cond) == true) 
            {   
                // run the current item of the sequence object.
		osweb.item_store.run(this._items[this._index - 1].item, this);
            }
  	    else
  	    {
  	    	// Execute the next cycle of the sequnce itself.
  	    	this.run();	
  	    }
	}
	else
	{
            // sequence is finalized.
            this.complete();
        }
    };
	
    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };

    // Bind the sequence class to the osweb namespace.
    osweb.sequence = osweb.promoteClass(sequence, "item");
}());
/*
 * Definition of the class sketchpad.
 */

(function() 
{
    function sketchpad(pExperiment, pName, pScript)
    {
	// Set publice properties.
    	this.canvas   = new osweb.canvas(pExperiment, false);
	this.elements = [];

	// Inherited create.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(sketchpad, osweb.generic_response);

    // Definition of public properties. 
    p.canvas   = null;
    p.elements = [];

    /*
     * Definition of private methods - build cycle.         
     */
    
    p._compare = function(a,b) 
    {
        // Sort function used for determining the draw index (z-index) of alle elemente.
        if (a.z_index() < b.z_index())
            return 1;
        else if (a.z_index() > b.z_index())
            return -1;
        else 
            return 0;
    };
    
    /*
     * Definition of public methods - build cycle..         
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
    	this.elements      = [];
	this.vars.duration = 'keypress';
    };

    p.from_string = function(pString)
    {
        // Define and reset variables to their defaults.
        this.variables = {};
        this.comments  = [];
 	this.reset();
		
	// Split the string into an array of lines.  
	if (pString != null)
	{
            var lines = pString.split('\n');
            for (var i=0; i < lines.length; i++)
            {
		if ((lines[i] != '') && (this.parse_variable(lines[i]) == false))
		{
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'draw'))
                    {
			if (osweb.isClass(tokens[1]) == true)
			{
                            var element = osweb.newElementClass(tokens[1], this, lines[i]);
                            this.elements.push(element);	
			}	
                        else
			{
                            // error.
			}
                    }
		}
            }

            // Sort the elements usin the z-index.
            this.elements.sort(this._compare);
        }					
    };
	
    /*
     * Definition of public methods - runn cycle.         
     */

    p.prepare = function()
    {
        // Draw the elements. 
	for (var i=0; i < this.elements.length; i++)
	{
            if (this.elements[i].is_shown() == true)
            {
		this.elements[i].draw();
            }			
	}				
    
        // Inherited.	
	this.generic_response_prepare();
    };

    p.run = function()
    {
	// Inherited.	
	this.generic_response_run();
		
        // Set the onset and start the stimulus response process.        
	this.set_item_onset(this.canvas.show()); 
	this.set_sri(false);
	this.process_response();
    };
	
    p.complete = function()
    {
	// Clear the canvas.
	this.canvas.clear();
		
	// Inherited.	
	this.generic_response_complete();
    };

    // Bind the sketchpad class to the osweb namespace.
    osweb.sketchpad = osweb.promoteClass(sketchpad, "generic_response");
}());

/*
 * Definition of the class feedback.
 */

(function() 
{
    function feedback(pExperiment, pName, pScript)
    {
	// Inherited create.
	this.sketchpad_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(feedback, osweb.sketchpad);

    // Definition of public properties. 
    p.description = 'Provides feedback to the participant';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this.sketchpad_reset();
	this.vars.reset_variables = 'yes';
    };	
    
    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function()
    {
        // Prepares the item.
        this._parent.prepare_complete();
    };

    p.run = function()
    {
    	// Inherited.	
	this.sketchpad_prepare();
	this.sketchpad_run();
    };

    p.complete = function()
    {
    	// Inherited.	
	this.sketchpad_complete();

	// Reset feedback variables.
	if (this.vars.reset_variables == 'yes')
	{
            this.experiment.reset_feedback();
	}
    };

    // Bind the feedback class to the osweb namespace.
    osweb.feedback = osweb.promoteClass(feedback, "sketchpad");
}());

/*
 * Definition of the class synth.
 */

(function() 
{
    function synth(pExperiment, pName, pScript)
    {
	// Inherited.
	this.sampler_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(synth, osweb.sampler);

    // Define and set the public properties. 
    p.description = 'A basic sound synthesizer';

    /*
     * Definition of public class methods.
     */

    // Bind the synth class to the osweb namespace.
    osweb.synth = osweb.promoteClass(synth, "sampler");
}());

/*
 * Definition of the class advanced_delay.
 */

(function() 
{
    function advanced_delay(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    
        // Set private properties.
        this._duration = -1;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(advanced_delay, osweb.item);

    // Define and set the public properties. 
    p.description = 'Waits for a specified duration';

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this.vars.duration    = 1000;
	this.vars.jitter      = 0;
	this.vars.jitter_mode = 'Uniform';
    }; 
    
    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
	this._duration = this.vars.duration;
        /* # Sanity check on the duration value, which should be a positive numeric
	# value.
	if type(self.var.duration) not in (int, float) or self.var.duration < 0:
		raise osexception(
			u'Duration should be a positive numeric value in advanced_delay %s' \
			% self.name)
	if self.var.jitter_mode == u'Uniform':
		self._duration = random.uniform(self.var.duration-self.var.jitter/2,
			self.var.duration+self.var.jitter/2)
	elif self.var.jitter_mode == u'Std. Dev.':
		self._duration = random.gauss(self.var.duration, self.var.jitter)
	else:
		raise osexception(
			u'Unknown jitter mode in advanced_delay %s' % self.name)
	# Don't allow negative durations.
	if self._duration < 0:
		self._duration = 0
	self._duration = int(self._duration)
	self.experiment.var.set(u'delay_%s' % self.name, self._duration)
	debug.msg(u"delay for %s ms" % self._duration) */

        // Inherited.	
	this.item_prepare();
    };
    
    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

        // Set the onset time.
        this.set_item_onset(this.time());
        this.sleep(this._duration);		
    };

    // Bind the advanced_delay class to the osweb namespace.
    osweb.advanced_delay = osweb.promoteClass(advanced_delay, "item");
}());

/*
 * Definition of the class form_base.
 */

(function() 
{
    function form_base(pName, pExperiment, pScript, pItem_type, pDescription)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);

        // Set the class private properties.
        this._form_text = false;
    
        // Set the class public properties.
        this.description = pDescription;
        this.item_type   = pItem_type;
    }   
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_base, osweb.item);

    // Define and set the public properties. 
    p.cols        = [];
    p.description = 'A generic form plug-in';
    p.form        = null;
    p.rows        = [];
    
    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function() 
    {
  	// Resets all item variables to their default value.
  	this.vars.cols        = '2;2';
	this.vars.rows        = '2;2';
	this.vars.spacing     = 10;
	this.vars._theme      = 'gray';
	this.vars.only_render = 'no';
	this.vars.timeout     = 'infinite';
	this.vars.margins     = '50;50;50;50';
	this._variables       = [];   
	this._widgets         = [];
    };    

    p.parse_line = function(pString)
    {
        // Split the line in tokens.
        var list = this.syntax.split(pString);

        if ((this._form_text == true) && (list[0] != '__end__'))
        {
            this.vars['form_text'] = this.vars['form_text'] + pString.replace('\t','');
        };

        // Check for widget definition.
        if (list[0] == 'widget')
        {
            // Remove widget command.
            list.shift();

            // Add widget to the list.
            this._widgets.push(list);
        }
        else if (list[0] == '__form_text__')
        {
            this.vars['form_text'] = '';
            this._form_text        = true;
        }
        else if (list[0] == '__end__')
        {
            this._form_text = false;
        }
        
        /* if u'var' in kwdict:
	 self._variables.append(kwdict[u'var'])   */  
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Inherited.	
    	this.item_prepare();

        // Retrieve the column, rows and margins.
        var cols    = this.vars.cols.split(';');
        var rows    = this.vars.rows.split(';');
        var margins = this.vars.margins.split(';'); 
        
        // Get the time out paramter.
        if (this.vars.timeout == 'infinite')
        {                
            var timeout = null;
        }    
        else
        {    
            var timeout = this.vars.timeout;
        }    
        
        // Create the basic form.    
        this.form = new osweb.form(this.experiment, cols, rows, this.vars.spacing, margins, this.vars._theme, this, timeout, this.vars.form_clicks == 'yes');

        for (var i=0;i < this._widgets.length; i++)
        {
            this.focus_widget = null;
            var kwdict = {};
            var parameters = [];
            parameters.push(this.form);
            if (this._widgets[i].length > 5) 
            {
                for (var j=5;j < this._widgets[i].length;j++)
                {
                    var varName  = String(this._widgets[i][j]).substr(0,String(this._widgets[i][j]).indexOf('='));
                    var varValue = String(this._widgets[i][j]).substring(String(this._widgets[i][j]).indexOf('=') + 1,String(this._widgets[i][j]).length);
                    kwdict[varName] = osweb.syntax.remove_quotes(varValue);
                    kwdict[varName] = osweb.syntax.eval_text(kwdict[varName], this.vars);
                
                    parameters.push(osweb.syntax.remove_quotes(varValue));
                } 
            }

            /* # Process focus keyword
            focus = False
            if u'focus' in kwdict:
                if kwdict[u'focus'] == u'yes':
                    focus = True
                del kwdict[u'focus'] */
            
            // Parse arguments
            var _type   = this._widgets[i][4];
            var col     = this._widgets[i][0];
            var row     = this._widgets[i][1];
            var colspan = this._widgets[i][2];
            var rowspan = this._widgets[i][3];
	
            // Create the widget.
            try 
            {
                var _w = osweb.newWidgetClass(_type, this.form, kwdict);
                //console.log(parameters);
                //var _w = osweb.newWidgetClass(_type, parameters);
            }
            catch(e)
            {
                osweb.debug.addError('Failed to create widget ' + _type + ', error:' + e);
            }    
                
            // Set the width position and form.                    
            this.form.set_widget(_w, [col, row], colspan, rowspan);
            
            // Add as focus widget
            if (focus == true) 
            {
            	if (this.focus_widget != null)
                {
                    osweb.debug.addError('Osweb error: You can only specify one focus widget');
                } 
                else
                {
                    this.focus_widget = _w;
                }
            }    
        }
    };

    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

        // Set dimensions.
        this.form._parentform.style.width      = osweb.runner._canvas.width;
        this.form._parentform.style.height     = osweb.runner._canvas.height;
        this.form._parentform.style.background = this.experiment.vars.background;
                
        // Hide the canvas, show the form.
        osweb.runner._canvas.style.display  = 'none';
        this.form._parentform.style.display = 'block';
        this.form._form.style.display       = 'block';
    };

    p.complete = function()
    {
        // Hide the form
        this.form._parentform.style.display = 'none';
        this.form._form.style.display       = 'none';
        osweb.runner._canvas.style.display  = 'inline';

        // form is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        this.item_complete();
    };

    // Bind the form_base class to the osweb namespace.
    osweb.form_base = osweb.promoteClass(form_base, "item");
}());

/*
 * Definition of the class form_consent.
 */

(function() 
{
    function form_consent(pExperiment, pName, pScript)
    {
        // Inherited.
	this.form_base_constructor(pName, pExperiment, pScript, 'form_consent', 'A simple consent form');
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_consent, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple consent form';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.form_base_run();
    };

    p.complete = function()
    {
        // Inherited.	
    	this.form_base_complete();
    };

    // Bind the form_consent class to the osweb namespace.
    osweb.form_consent = osweb.promoteClass(form_consent, "form_base");
}());

/*
 * Definition of the class form_multiple_choice.
 */

(function() 
{
    function form_multiple_choice(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_multiple_choice, osweb.item);
    
    // Define and set the public properties. 
    p.description = 'A simple multiple choice item';

    // Bind the form_base class to the osweb namespace.
    osweb.form_multiple_choice = osweb.promoteClass(form_multiple_choice, "item");
}());

/*
 * Definition of the class form_text_display.
 */

(function() 
{
    function form_text_display(pExperiment, pName, pScript)
    {
        // Inherited.
	this.form_base_constructor(pName, pExperiment, pScript, 'form_text_display', 'A simple text display form');
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_display, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text display form';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.form_base_run();
     };

    p.complete = function()
    {
        // Inherited.	
    	this.form_base_complete();
    };

    // Bind the form_text_display class to the osweb namespace.
    osweb.form_text_display = osweb.promoteClass(form_text_display, "form_base");
}());

/*
 * Definition of the class form_text_input.
 */

(function() 
{
    function form_text_input(pExperiment, pName, pScript)
    {
	// Inherited.
	this.form_base_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_input, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text input form';

    // Bind the form_base class to the osweb namespace.
    osweb.form_text_input = osweb.promoteClass(form_text_input, "form_base");
}());

/*
 * Definition of the class form_text_render.
 */

(function() 
{
    function form_text_render(pExperiment, pName, pScript)
    {
	// Inherited.
	this.form_base_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(form_text_render, osweb.form_base);

    // Define and set the public properties. 
    p.description = 'A simple text display form';

    // Bind the form_base class to the osweb namespace.
    osweb.form_text_render = osweb.promoteClass(form_text_render, "form_base");
}());

/*
 * Definition of the class media_player_vlc.
 */

(function() 
{
    function media_player_vlc(pExperiment, pName, pScript)
    {
	// Inherited.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(media_player_vlc, osweb.generic_response);

    // Define and set the public properties. 
    p.description = 'A video player';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
  	// Opens the video file for playback."""
        this._video        = osweb.pool[this.vars.get('video_src')];  
        this._video_player = new osweb.video_backend(this.experiment, this._video);
        
	// Convert the string to a boolean, for slightly faster evaluations in the run phase.
	this._fullscreen = (this.vars.get('fullscreen') == 'yes');
	
        // The dimensions of the video
	// this._w = int(cv.GetCaptureProperty(self.video, cv.CV_CAP_PROP_FRAME_WIDTH))
	// this._h = int(cv.GetCaptureProperty(self.video, cv.CV_CAP_PROP_FRAME_HEIGHT))

        if (this._fullscreen)
        { 
            // In fullscreen mode, the video is always shown in the top-left and the temporary images need to be fullscreen size
            //this._x      = 0;
            //this._y      = 0;
            //this.src_tmp = cv.CreateMat(self.experiment.var.height, self.experiment.var.width, cv.CV_8UC3);
            //this.src_rgb = cv.CreateMat(self.experiment.var.height, self.experiment.var.width, cv.CV_8UC3);
        }
        else
        {    
            // Otherwise the location of the video depends on its dimensions and the temporary image is the same size as the video
            //this._x      = max(0, (self.experiment.var.width - self._w) / 2);
            //this._y      = max(0, (self.experiment.var.height - self._h) / 2);
            //this.src_rgb = cv.CreateMat(self._h, self._w, cv.CV_8UC3);
        }

      	// Inherited.	
	this.generic_response_prepare();
    };    
    
    p.run = function() 
    {
        // Set the onset time.
        this.set_item_onset();
	this.set_sri();

        // Start the video player.
        this._video_player.play();    

        // Start response processing.
        this.process_response();
    };

    p.complete = function() 
    {
	// Stop the video playing.
	this._video_player.stop();
		
	// Inherited.	
	this.generic_response_complete();
    };    
    
    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());

/*
 * Definition of the class notepad.
 */

(function() 
{
    function notepad(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(notepad, osweb.item);

    // Define and set the public properties. 
    p.description = 'A simple notepad to document your experiment. This plug-in does nothing.';
    p.note        = '';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

	// Show the information of the notepad on the console.
	//osweb.debug.addMessage(this.note);

        // Complete the current cycle.
        this.complete();
    };

    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };

    // Bind the notepad class to the osweb namespace.
    osweb.notepad = osweb.promoteClass(notepad, "item");
}());

/*
 * Definition of the class repeat_cycle.
 */

(function() 
{
    function repeat_cycle(pExperiment, pName, pScript)
    {
    	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(repeat_cycle, osweb.item);

   // Define and set the public properties. 
    p.description = 'Optionally repeat a cycle from a loop';
    
    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Prepare the condtion for which the repeat_cycle must fire.
        this._condition = osweb.syntax.compile_cond(this.vars.get('condition'));

        // Inherited.	
	this.item_prepare();
    }; 

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
        {
            if (osweb.python_workspace._eval(this._condition) == true) 
            {            
                this.experiment.vars.repeat_cycle = 1;
            }
            
            // Complete the current cycle.
            this.complete();
        }
    };

    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };
    
    // Bind the repeat_cycle class to the osweb namespace.
    osweb.repeat_cycle = osweb.promoteClass(repeat_cycle, "item");
}());

/*
 * Definition of the class reset_feedback.
 */

(function() 
{
    function reset_feedback(pExperiment, pName, pScript)
    {
    	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(reset_feedback, osweb.item);

    // Define and set the public properties. 
    p.description = 'Resets the feedback variables, such as "avg_rt" and "acc"';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function()
    {
    	// Inherited.	
	this.item_run();
		
	// Run item only one time.   
	if (this._status != osweb.constants.STATUS_FINALIZE)
	{
            // Run the item.
            this.experiment.reset_feedback();

            // Complete the current cycle.
            this.complete();
        }
    };

    p.complete = function()
    {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;
 
        // Inherited.	
        this.item_complete();
    };
    
    // Bind the reset_feedback class to the osweb namespace.
    osweb.reset_feedback = osweb.promoteClass(reset_feedback, "item");
}());

/*
 * Definition of the class touch_response.
 */

(function() 
{
    function touch_response(pExperiment, pName, pScript)
    {
	// Inherited.
	this.mouse_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(touch_response, osweb.mouse_response);

    // Define and set the public properties. 
    p.description = 'A grid-based response item, convenient for touch screens';

    /*
     * Definition of public methods - build cycle.
     */
	
    p.reset = function()
    {
        // Inherited.
        this.mouse_response_reset();
        this.vars.set('allowed_responses',null);
	
        // Resets all item variables to their default value.
        this.vars._ncol = 2;
	this.vars._nrow = 1;
    };

    /*
     * Definition of public methods - run cycle.
     */
    
    p.prepare = function()
    {
        // Temp hack
        this.experiment.vars.correct = -1;
   
        // Inherited.
        this.mouse_response_prepare();
    };
        
    p.process_response_mouseclick = function(pRetval)
    {
        // Processes a mouseclick response.
	this.experiment._start_response_interval = this.sri;
	this.experiment._end_response_interval   = pRetval.rtTime;
	this.experiment.vars.response		 = pRetval.resp;
	this.synonyms                            = this._mouse.synonyms(this.experiment.vars.response);
	this.experiment.vars.cursor_x            = pRetval.event.clientX;
	this.experiment.vars.cursor_y            = pRetval.event.clientY;
	
        var rect = osweb.runner._canvas.getBoundingClientRect();
        if (this.experiment.vars.uniform_coordinates == 'yes')
        {
            this._x = pRetval.event.clientX + (this.experiment.vars.width / 2);
	    this._y = pRetval.event.clientY + (this.experiment.vars.height / 2);
        }
        else
        {
            this._x = pRetval.event.clientX - rect.left;
	    this._y = pRetval.event.clientY - rect.top;
        }    
        
        // Calulate the row, column and cell. 
        this.col  = Math.floor(this._x / (this.experiment.vars.width  / this.vars._ncol));
	this.row  = Math.floor(this._y / (this.experiment.vars.height / this.vars._nrow));
	this.cell = this.row * this.vars._ncol + this.col + 1;
        this.experiment.vars.response = this.cell;
        this.synonyms                 = [String(this.experiment.vars.response)];
                
        // Do the bookkeeping 
        this.response_bookkeeping();
    };            

    // Bind the touch_response class to the osweb namespace.
    osweb.touch_response = osweb.promoteClass(touch_response, "mouse_response");
}());

/*
 * Definition of the class base_element.
 */

(function() 
{
    function base_element(pSketchpad, pScript, pDefaults)
    {
	// Set the public properties.		
	this.canvas           = pSketchpad.canvas;
	this.defaults         = pDefaults;
	this.defaults.show_if = 'always';
	this.defaults.z_index = 0;
        this.experiment       = pSketchpad.experiment;
	this.fix_coordinates  = (pSketchpad.vars.uniform_coordinates == 'yes');
	this.name             = pSketchpad.name;
	this.only_keywords    = false;
	this.pool             = pSketchpad.experiment.pool;
	this.sketchpad        = pSketchpad;
	this.syntax           = pSketchpad.syntax;
	this.vars             = pSketchpad.vars;

        // Set the private properties.		
        this._properties      = null;   

        // Read the definition string.
	this.from_string(pScript);
    }; 
	
    // Extend the class from its base class.
    var p = base_element.prototype;

    // Set the class public properties. 
    p.defaults        = {};
    p.fix_coordinates = true;
    p.only_keywords   = false;
    p.properties      = {};
    p.sketchpad       = null;	
    p.vars            = null;
	        	
    /*
     * Definition of public methods - building cycle.         
     */

    p.from_string = function(pString)
    {
	var tokens = osweb.syntax.parse_cmd(pString);
	
	// Set the default properties.
	this.properties = {};
			
	// Set the define properties.
	for (var i=0; i < tokens.length; i++)
	{
            var name  = tokens[i].slice(0,tokens[i].indexOf('='));
            var value = tokens[i].slice(tokens[i].indexOf('=') + 1,tokens[i].length);
            var value = osweb.syntax.remove_quotes(value);
			
            // Set (and overwrite) the properties.
            this.properties[name] = value;
	}
    };

    /*
     * Definition of public methods - running cycle.         
     */

    p.z_index = function()
    {
    	//  Determines the drawing order of the elements. 
    	return this.properties.z_index;
    };

    p.eval_properties = function()
    {
	// Evaluates all properties and return them.
	this._properties = {};
		
	var xc = this.experiment.vars.width / 2;
	var yc = this.experiment.vars.height / 2;

    	for (var property in this.properties) 
	{
            var value = this.sketchpad.syntax.eval_text(this.properties[property]);
            /* if var == u'text':
			round_float = True
                else:
			round_float = False
		val = self.sketchpad.syntax.auto_type(
			self.sketchpad.syntax.eval_text(val, round_float=round_float))
		if self.fix_coordinates and type(val) in (int, float): */
            if ((property  == 'x') || (property  == 'x1') || (property  == 'x2'))
            {
            	value = Number(value) + xc;
            };
            if ((property  == 'y') || (property  == 'y1') || (property  == 'y2'))
            {
		value = Number(value) + yc;
            };

            this._properties[property] = value; 
	}
    };		
		
    p.is_shown = function()
    {
        // Set the self of the current workspace.
        this.experiment.python_workspace['self'] = this.sketchpad;
        
        // Determines whether the element should be shown, based on the show-if statement.
	return this.experiment.python_workspace._eval(this.experiment.syntax.compile_cond(this.properties['show_if']));
    };
	
    p.draw = function()
    {
        // Calculate the dynamic properties.
        this.eval_properties();
    };

    // Bind the base_element class to the osweb namespace.
    osweb.base_element = base_element;
}());

/*
 * Definition of the class arrow.
 */

(function() 
{
    function arrow(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults		        = {};
	this.defaults.arrow_body_length = 0.8;
	this.defaults.arrow_body_width  = 0.5;
	this.defaults.arrow_head_width  = 30;
	this.defaults.fill     		= 1;
	this.defaults.color    		= pSketchpad.vars.get('foreground');
	this.defaults.penwidth 		= 1;
	this.defaults.x1       		= null;
	this.defaults.y1       		= null;
	this.defaults.x2                = null;
	this.defaults.y2       		= null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(arrow, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */

    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the arrow element to the canvas of the sketchpad.
	this.sketchpad.canvas.arrow(this._properties.x1, this._properties.y1, this._properties.x2, this._properties.y2, this._properties.color, this._properties.penwidth, 
                                    this._properties.arrow_head_width, this._properties.arrow_body_width, this._properties.arrow_body_length, this._properties.fill);
    };
    
    // Bind the Arrow class to the osweb namespace.
    osweb.arrow = osweb.promoteClass(arrow, "base_element");
}());

/*
 * Definition of the class circle.
 */

(function() 
{
    function circle(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.fill     = 0;
	this.defaults.penwidth = 1;
	this.defaults.x        = null;
	this.defaults.y        = null;
	this.defaults.r        = null;
		
	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(circle, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */
	
    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the circle element to the canvas of the sketchpad.
	this.sketchpad.canvas.circle(this._properties.x, this._properties.y, this._properties.r, this._properties.fill, this._properties.color, this._properties.penwidth);
    };
    
    // Bind the Circle class to the osweb namespace.
    osweb.circle = osweb.promoteClass(circle,"base_element");
}());

/*
 * Definition of the class ellipse.
 */

(function() 
{
    function ellipse(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.fill     = 1;
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.penwidth = 1;
	this.defaults.x        = null;
	this.defaults.y        = null;
	this.defaults.w        = null;
	this.defaults.h        = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(ellipse, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */
	
    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the ellipse element to the canvas of the sketchpad.
        this.sketchpad.canvas.ellipse(Number(this._properties.x), Number(this._properties.y), Number(this._properties.w), Number(this._properties.h), 
                                      this._properties.fill, this._properties.color, this._properties.penwidth);
    };
    
    // Bind the ellipse class to the osweb namespace.
    osweb.ellipse = osweb.promoteClass(ellipse,"base_element");
}());

/*
 * Definition of the class fixdot.
 */

(function() 
{
    function fixdot(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.style    = 'default';
	this.defaults.x        = null;
	this.defaults.y        = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(fixdot, osweb.base_element);

    /*
     * Definition of public methods - running cycle.         
     */
	
    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the fixdot element to the canvas of the sketchpad.
	this.sketchpad.canvas.fixdot(this._properties.x, this._properties.y, this._properties.color, this._properties.style);
    };
    
    // Bind the fixdot class to the osweb namespace.
    osweb.fixdot = osweb.promoteClass(fixdot,"base_element");
}());

/*
 * Definition of the class gabor.
 */

(function() 
{
    function gabor(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults        = {};
	this.defaults.bgmode = 'avg';
	this.defaults.color1 = 'white';
	this.defaults.color2 = 'black';
	this.defaults.env    = 'gaussian';
	this.defaults.freq   = 1;
	this.defaults.orient = 0;
	this.defaults.phase  = 0;
	this.defaults.size   = 96;
	this.defaults.stdev  = 12;
	this.defaults.x      = null;
	this.defaults.y      = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(gabor, osweb.base_element);

    /*
     * Definition of public methods (run cycle).   
     */

    p.draw = function()
    {
        // Inherited.	
    	this.base_element_draw();
		
	// Draw the gabor element to the canvas of the sketchpad.
	this.sketchpad.canvas.gabor(this._properties.x, this._properties.y, this._properties.orient, this._properties.freq, this._properties.env, 
                                    this._properties.size, this._properties.stdev, this._properties.phase, this._properties.color1, this._properties.color2, this._properties.bgmode);
    };
    
    // Bind the gabor class to the osweb namespace.
    osweb.gabor = osweb.promoteClass(gabor,"base_element");
}());

/*
 * Definition of the class image.
 */

(function() 
{
    function image(pSketchpad, pScript)
    {
	// Set the class public properties.
	this.defaults	     = {};
	this.defaults.center = 1;
	this.defaults.file   = null;
	this.defaults.scale  = 1;
	this.defaults.x      = null;
	this.defaults.y      = null;

	// Set the class private properties. 
	this._file           = null;
		
	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(image, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */

    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();

    	// Retrieve the content from the file pool.
	this._file = osweb.pool[this._properties['file']];  

	// Draw the image element to the canvas of the sketchpad.
	this.sketchpad.canvas.image(this._file, this._properties.center, this._properties.x, this._properties.y, this._properties.scale);
    };
    
    // Bind the image class to the osweb namespace.
    osweb.image = osweb.promoteClass(image, "base_element");
}());

/*
 * Definition of the class line.
 */

(function() 
{
    function line(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.penwidth = 1;
	this.defaults.x1       = null;
	this.defaults.y1       = null;
	this.defaults.x2       = null;
	this.defaults.y2       = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 

    // Extend the class from its base class.
    var p = osweb.extendClass(line, osweb.base_element);

    /*
     * Definition of public methods - run cycle.   
     */
	
    p.draw = function()
    {
        // Inherited.	
	this.base_element_draw();
		
	// Draw the line element to the canvas of the sketchpad.
	this.sketchpad.canvas.line(this._properties.x1, this._properties.y1, this._properties.x2, this._properties.y2, 
                                   this._properties.color, this._properties.penwidth);
    };
        
    // Bind the line class to the osweb namespace.
    osweb.line = osweb.promoteClass(line,"base_element");
}());

/*
 * Definition of the class noise.
 */

(function() 
{
    function noise(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults	     = {};
	this.defaults.color1 = 'white';
	this.defaults.color2 = 'black';
	this.defaults.env    = 'gaussian';
	this.defaults.size   = 96;
	this.defaults.stdev  = 12;
	this.defaults.x      = null;
	this.defaults.y      = null;
	this.defaults.bgmode = 'avg';

        // Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(noise, osweb.base_element);

    /*
     * Definition of public methods (run cycle).   
     */

    p.draw = function()
    {
        // Inherited.	
    	this.base_element_draw();
		
	// Draw the noise element to the canvas of the sketchpad.
	this.sketchpad.canvas.noise(this._properties.x, this._properties.y, this._properties.env, this._properties.size, 
                                    this._properties.stdev, this._properties.color1, this._properties.color2, this._properties.bgmode);
    };
    
    // Bind the noise class to the osweb namespace.
    osweb.noise = osweb.promoteClass(noise,"base_element");
}());

/*
 * Definition of the class rect.
 */

(function() 
{
    function rect(pSketchpad, pScript)
    {
	// Set the default properties.
	this.defaults          = {};
	this.defaults.fill     = 1;
	this.defaults.color    = pSketchpad.vars.get('foreground');
	this.defaults.penwidth = 1;
	this.defaults.x        = null;
	this.defaults.y        = null;
	this.defaults.w        = null;
	this.defaults.h        = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(rect, osweb.base_element);
	
    /*
     * Definition of public methods - run cycle.   
     */

    p.draw = function()
    {
        // Inherited.	
    	this.base_element_draw();
		
	// Draw the rectangle element to the canvas of the sketchpad.
	this.sketchpad.canvas.rect(this._properties.x, this._properties.y, this._properties.w, this._properties.h, 
                                   this._properties.fill, this._properties.color, this._properties.penwidth);
    };
    
    // Bind the Rect class to the osweb namespace.
    osweb.rect = osweb.promoteClass(rect,"base_element");
}());

/*
 * Definition of the class textline.
 */

(function() 
{
    function textline(pSketchpad, pScript)
    {
        // Set the default properties.
	this.defaults             = {};
	this.defaults.center      = 1;
	this.defaults.color       = pSketchpad.vars.get('foreground');
	this.defaults.font_family = pSketchpad.vars.get('font_family');
	this.defaults.font_size   = pSketchpad.vars.get('font_size');
	this.defaults.font_bold   = pSketchpad.vars.get('font_bold');
	this.defaults.font_italic = pSketchpad.vars.get('font_italic');
	this.defaults.html        = 'yes';
	this.defaults.text        = null;
	this.defaults.x           = null;
	this.defaults.y           = null;

	// Inherited.
	this.base_element_constructor(pSketchpad, pScript, this.defaults);
    } 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(textline, osweb.base_element);
	
    /*
     * Definition of public methods - running cycle.         
     */

    p.draw = function()
    {
        // Inherited.	
    	this.base_element_draw();
		
    	// Set the font style and draw the text element to the canvas of the sketchpad.
	this.sketchpad.canvas.set_font(this._properties.font_family, this._properties.font_size, this._properties.font_italic == 'yes', this._properties.font_bold == 'yes', this._properties.font_underline == 'yes');		
        this.sketchpad.canvas.text(this._properties.text, this._properties.center, this._properties.x, this._properties.y, this._properties.color, this._properties.html);
    };
    
    // Bind the Text class to the osweb namespace.
    osweb.textline = osweb.promoteClass(textline, "base_element");
}());
	
/*
 * Definition of the class form.
 */

(function() 
{
    function form(pExperiment, pCols, pRows, pSpacing, pMargins, pTheme, pItem, pTimeout, pClicks)
    {
        // Set the class public properties.
        this.clicks     = pClicks;
	this.experiment = pExperiment;
	this.height     = this.experiment.vars.height;
	this.item       = (pItem != null) ? pItem : pExperiment;
	this.margins    = pMargins;
        this.spacing    = pSpacing;
	this.span       = [];
        this.timeout    = pTimeout;
	this.widgets    = []; 
        this.width      = this.experiment.vars.width;
        
        // Set the class public properties - columns and rows.
        var colSize = 0;
        for (var i=0;i < pCols.length;i++)
        {
            colSize = colSize + Number(pCols[i]);
        }
        this.cols = [];
        for (var i=0;i < pCols.length;i++)
        {
            this.cols.push(Math.round((pCols[i] / colSize) * 100));
        }    
        var rowSize = 0;
        for (var i=0;i < pRows.length;i++)
        {
            rowSize = rowSize + Number(pRows[i]);
        }
        this.rows = [];
        for (var i=0;i < pRows.length;i++)
        {
            this.rows.push(Math.round((pRows[i] / rowSize) * 100));
        }

        // Set the class private properties.
        this._parentform         = document.getElementById('osweb_form');
        this._form               = document.createElement("DIV");
        this._form.style.height  = '100%';
        this._form.style.width   = '100%';
        this._form.style.display = 'none';
        
        // Set the table properties and content.
        this._table                  = document.createElement("TABLE");
        this._table.style.padding    = this.margins[0] + 'px ' + this.margins[1] + 'px ' + this.margins[2] + 'px ' + this.margins[3] + 'px';
        this._table.style.height     = '100%';
        this._table.style.width      = '100%';
        this._table.style.fontStyle  = this.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._table.style.fontWeight = this.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._table.style.fontFamily = this.experiment.vars.font_family;
        this._table.style.color      = this.experiment.vars.foreground;
        this._table.style.fontSize   = this.experiment.vars.font_size + 'px';
        
        for (var i=0;i < this.rows.length;i++)
        {
            // Insert the row into the table.
            var row          = this._table.insertRow();
            row.style.height = this.rows[i] + '%';
            
            // Inser the cells.
            for (var j=0;j < this.cols.length;j++)
            {
                var cell = row.insertCell(j);
                cell.style.width   = this.cols[j] + '%';
                cell.style.padding = '5px';
            }    
        }        

        // Append the table to the form.
        this._parentform.appendChild(this._form);
        this._form.appendChild(this._table);
        
        // Dynamically load the theme object
	/* theme_mod = __import__(u'libopensesame.widgets.themes.%s' % theme, fromlist=[u'dummy'])
	theme_cls = getattr(theme_mod, theme)
	self.theme_engine = theme_cls(self) */
    } 
	
    // Extend the class from its base class.
    var p = form.prototype;

    // Definition of class public properties. 
    p.clicks     = null;
    p.experiment = null;
    p.height     = -1;
    p.item       = null;
    p.spacing    = null;
    p.timeout    = -1;
    p.width      = -1;
    
    /*
     * Definition of public methods - general function.
     */

    p._exec = function(pFocus_widget)
    {
    };   

    p.timed_out = function()
    {
    };

    p.cell_index = function(pPos)
    {
    };

    p.validate_geometry = function()
    {
    };

    p.get_cell = function(pIndex)
    {
    };
    
    p.get_rect = function(pIndex)
    {
    };

    p.render = function()
    {
	this.validate_geometry();
	this.canvas.clear();
	for (var widget in this.widgets)
	{
            if (widget !== null)
            {
                widget.render();
            }    
        }		
        
        this.canvas.show();
    };    

    p.set_widget = function(pWidget, pPos, pColspan, pRowspan)
    {
        // Get the row postition of the widget.
        var row  = this._table.rows[Number(pPos[1])];
        var cell = row.cells[Number(pPos[0])]; 
        if (Number(pColspan) > 1)
        {
            cell.colSpan = Number(pColspan);
        }
        if (Number(pRowspan) > 1)
        {
            cell.rowSpan = Number(pRowspan);
        }
        
        // Append widget to the cell.
        cell.appendChild(pWidget._element);
        
        /* var index = this.cell_index(nPos;)
	if (index >= len(this.widgets)
        {
            // raise osexception(u'Widget position (%s, %s) is outside of the form' % pos)
        }
        if type(colspan) != int or colspan < 1 or colspan > len(self.cols):
			raise osexception( \
				u'Column span %s is invalid (i.e. too large, too small, or not a number)' \
				% colspan)
		if type(rowspan) != int or rowspan < 1 or rowspan > len(self.rows):
			raise osexception( \
				u'Row span %s is invalid (i.e. too large, too small, or not a number)' \
				% rowspan) 
	this.widgets[index] = widget;
	this.span[index]    = colspan, rowspan
        this.widget.set_rect(this.get_rect(index)) */
    };

    p.xy_to_index = function(pXy)
    {
    };
  
    // Bind the form class to the osweb namespace.
    osweb.form = form;
}());
	
/*
 * Definition of the class widget.
 */

(function() 
{
    function widget(pForm)
    {
        // Set the class public properties.
	this.focus = false;
	this.form  = pForm;
	this.rect  = null;
	this.type  = 'widget';
	this.vars  = null;
    } 
	
    // Extend the class from its base class.
    var p = widget.prototype;

    // Definition of class public properties. 
    p.form  = null;
    p.focus = false;
    p.rect  = null;
    p.type  = '';	
    p.vars  = null;

    /*
     * Definition of public methods - general function.
     */

    p.box_size = function()
    {
        return null;
    };            

    p.theme_engine = function()
    {
        return null;
    };
    
    p.draw_frame = function(pRect, pStyle)
    {
    };    

    p.on_mouse_click = function(pevent)
    {
    };        

    p.render = function()
    {
    };

    p.set_rect = function(pRect)
    {
    };
    
    p.set_var = function(pVal, pVar)
    {
        // Sets an experimental variable.
        if (pVar == null)
        {
            pVar = this.vars;
        }    
	
        if (pVar != null)
        {
            this.form.experiment.vars.set(pVar, pVal);  
        }  
    };    
    
    // Bind the widget class to the osweb namespace.
    osweb.widget = widget;
}());

/*
 * Definition of the class button.
 */

(function() 
{
    function button(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element = document.createElement("BUTTON");
        this._element.style.width  = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];
        this._element.style.fontStyle  = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._element.style.fontWeight = this.form.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color      = this.form.experiment.vars.foreground;
        this._element.style.fontSize   = this.form.experiment.vars.font_size + 'px';

        // Add event listener to the element.
        this._element.addEventListener("click", this.response.bind(this));

        // Set the class public properties.
	this.center  = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false; 
        this.frame   = (typeof pProperties['frame']  == 'boolean') ? pProperties['frame']  : false; 
        this.tab_str = '    ';
	this.type    = 'button';
	this.x_pad   = 8;
	this.y_pad   = 8;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(button, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = null;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event)
    {
        console.log(this);
        // Complete the parent form.
        this.form.item.complete();
    };

    p.draw_text = function(pText, pHtml)
    {
        // Draws text inside the widget.
	pText = this.form.experiment.syntax.eval_text(pText);
	pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true)
        {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        }  
        else
        {        
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }
        
        var w = this.rect.w - 2 * this.x_pad;
        
	this.form.canvas.text(pText, this.center, x, y, w, pHtml);
    };    

    p.render = function()
    {
	// Draws the widget.
        if (this.frame == true)
        {    
            this.draw_frame(this.rect);
        }
        
        this.draw_text(this.text); 
    };            
                
    // Bind the button class to the osweb namespace.
    osweb.button = osweb.promoteClass(button, "widget");
}());

/*
 * Definition of the class checkbox.
 */

(function() 
{
    function checkbox(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element       = document.createElement("LABEL"); 
        this._element_check = document.createElement("INPUT");
        this._element_check.setAttribute("type", "checkbox");
        this._element.style.width      = '100%';
        this._element.style.height     = '100%';
        this._element.textContent        = pProperties['text'];
        
        //this._element.innerHTML        = pProperties['text'];
        this._element.style.fontStyle  = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal'; 
        this._element.style.fontWeight = this.form.experiment.vars.font_bold   == 'yes' ? 'bold'   : 'normal'; 
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color      = this.form.experiment.vars.foreground;
        this._element.style.fontSize   = this.form.experiment.vars.font_size + 'px';
        this._element.appendChild(this._element_check);

        // Add event listener to the element.
        this._element.addEventListener("click", this.on_mouse_click.bind(this));

        console.log('---');
        console.log(pProperties);

        // Set the class public properties.
	this.click_accepts = (typeof pProperties.click_accepts === 'undefined') ? false : pProperties.click_accepts;
	this.group         = (typeof pProperties.group === 'undefined') ? null : pProperties.group;
	this.type          = 'checkbox';
        this.var           = (typeof pProperties.var === 'undefined') ? null : pProperties.var;
        this.checked       = (typeof pProperties.checked === 'checked') ? false  : pProperties.checked;
        
        // Set the current status of the checkbox.
        this.set_var(this.checked);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = null;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods.
     */

    p.on_mouse_click = function(event)
    {
       console.log('checkbox clicked'); 
    
    };
                
    // Bind the checkbox class to the osweb namespace.
    osweb.checkbox = osweb.promoteClass(checkbox, "widget");
}());

/*
 * Definition of the class label.
 */

(function() 
{
    function label(pForm, pProperties)
    {
	// Inherited create.
	this.widget_constructor(pForm);
	
        // Set the class private properties.
        this._element = document.createElement("SPAN");
        this._element.innerHTML = pProperties['text'];
        
        // Set the class public properties.
	this.center  = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false; 
        this.frame   = (typeof pProperties['frame']  == 'boolean') ? pProperties['frame']  : false; 
        this.tab_str = '    ';
	this.type    = 'label';
	this.x_pad   = 8;
	this.y_pad   = 8;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(label, osweb.widget);

    // Definition of public properties. 
    p.center  = false;
    p.frame   = false;
    p.tab_str = '';
    p.text    = '';
    p.x_pad   = 0;
    p.y_pad   = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.draw_text = function(pText, pHtml)
    {
        // Draws text inside the widget.
	pText = this.form.experiment.syntax.eval_text(pText);
	pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true)
        {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        }  
        else
        {        
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }
        
        var w = this.rect.w - 2 * this.x_pad;
        
	this.form.canvas.text(pText, this.center, x, y, w, pHtml);
    };    

    p.render = function()
    {
	// Draws the widget.
        if (this.frame == true)
        {    
            this.draw_frame(this.rect);
        }
        
        this.draw_text(this.text); 
    };            
                
    // Bind the label class to the osweb namespace.
    osweb.label = osweb.promoteClass(label, "widget");
}());

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
    };

    events._videoUpdate = function(event)
    {
        console.log('video update');
        
        this._ctx.drawImage(this._video, 0, 0);
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

/*
 * Definition of the class Parameters.
 */

(function() 
{
    function parameters()
    {
	throw "The class parameters cannot be instantiated!";
    } 

    // Set the private properties. 
    parameters._itemCounter = 0;
    parameters._parameters  = new Array();

    // Set the public properties. 
    parameters.displaySummary   = false;
    parameters.useDefaultValues = false;

    /*
     * Definition of private methods - initialize parameters.   
     */

    parameters._initialize = function()
    {
      	// Set properties if defined.
    	var parameter = {dataType: '0', defaultValue: '0', name: 'subject_nr', prompt: 'Please enter the subject number', promptEnabled: true};
        
        // Add the subject parameter to the parameters list.
        this._parameters.push(parameter);
    };

    /*
     * Definition of private methods - process parameters.   
     */
    
    parameters._processParameters = function()
    {
    	// Process all items for which a user input is required.
        if (this._itemCounter < this._parameters.length)
        {	
            // Process the Parameter.
            if (this.useDefaultValues == false)
            {
                this._processParameter(this._parameters[this._itemCounter]);
            }
            else
            {
                // Transfer the startup info to the context.
                this._transferParameters();
            }    
        }
        else
        {
            // All items have been processed, contine the Runner processing.
            if (this.displaySummary == true) 
            {
                // Show a summary of the the startup information. 
                this._showParameters();
            }
            else
            {            
                // Transfer the startup info to the context.
                this._transferParameters();
            }
        }
    };

    parameters._processParameter = function(parameter)
    {
        // Check if a user request is required.
        if (parameter.promptEnabled == true)
        {
            this._showDialog(parameter.dataType);

            // Set the dialog interface.
            if (parameter.response == '')
            {
            	document.getElementById('qpdialoginput').value = parameter.defaultValue;
            }
            else
            {
            	document.getElementById('qpdialoginput').value = parameter.defaultValue;
            }

            document.getElementById('dialogboxhead').innerHTML = parameter.prompt;
            document.getElementById('qpbuttonyes').onclick = function()
            {
                // Get the response information
                parameter.response = document.getElementById('qpdialoginput').value;
                            
                // Close the dialog.
                this._hideDialog();
            
                // Increase the counter.
                this._itemCounter++;

                // Continue processing.
                this._processParameters();

            }.bind(this);
        	
            document.getElementById('qpbuttonno').onclick = function()
            {
                // Close the dialog.
	        this._hideDialog();
                
   		// Finalize the introscreen elements.
		osweb.runner._finalizeIntroScreen();

          	// Return to the QPrime object
		// osweb.Runner._finalize();

            }.bind(this);
        }
        else
        {
            // Assign default value to the Startup item.
            parameter.response = parameter.defaultValue;
           
            // Increase the counter.
            this._itemCounter++;

            // Continue processing.
            this._processParameters();
        }    
    };

    parameters._showParameters = function()
    {
        document.getElementById('dialogboxhead').innerHTML = 'Summary of startup info';
        document.getElementById('qpbuttonyes').onclick = function()
	{
            // Close the dialog.
	    this._hideDialog();
                        
            // Transfer the startup info to the context.
            this._transferParameters(); 
        
        }.bind(this);    
        
        document.getElementById('qpbuttonno').onclick = function()
	{
            // Close the dialog.
            this._hideDialog();
                       
            // Reset the item counter.
            this._itemCounter = 0;
                        
            // Restat the input process.    
            this._processParameters(); 
            
        }.bind(this);    

        document.getElementById('qpbuttoncancel').onclick = function()
	{
            // Close the dialog.
	    this._hideDialog();
        
            // Finalize the introscreen elements.
            osweb.runner._finalizeIntroScreen();
    
            // Return to the QPrime object
            // osweb.Runner._finalize();

        }.bind(this);    
       
  	// Set the dialog interface.
        var TmpString = '';
        for (var i=0;i < this._parameters.length;i++)
        {
            if ((this._parameters[i].enabled != 0) && (this._parameters[i].promptEnabled != 0))
            {
		TmpString = TmpString + this._parameters[i].name + ': ' + this._parameters[i].response + '\r\n';  	        	
            }
        }

        document.getElementById('qpdialogtextarea').innerHTML = TmpString;
    };

    parameters._transferParameters = function()
    {
    	// Transfer the startup info items to the context.
        for (var i=0;i < this._parameters.length;i++)
        {
            osweb.runner.experiment.vars.set(this._parameters[i].name,this._parameters[i].response);
        }
        
	// Parameters are processed, next phase.
        osweb.runner._prepareStartScreen();
    };
    
    /*
     * Definition of class methods (dialogs).   
     */
     
    parameters._showDialog = function(dialogType) 
    {
        var dialogoverlay = document.getElementById('dialogoverlay');
	var dialogbox     = document.getElementById('dialogbox');
		                
	dialogoverlay.style.display = "block";
	dialogoverlay.style.height  = window.innerHeight + "px";
	dialogbox.style.left        = (window.innerWidth / 2) - (400 * .5) + "px";
	dialogbox.style.top         = "200px";
	dialogbox.style.display     = "inline";

	switch (dialogType)
        {
	    case "0": 
                document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
	    	document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "1": 
	        document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
		document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "2": 
	        document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
		document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                document.getElementById('qpdialoginput').focus();
            break;
            case "3": 
	        document.getElementById('dialogboxbody').innerHTML = '<textarea id="qpdialogtextarea"></textarea>';
                document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Yes</button><button id="qpbuttonno">No</button><button id="qpbuttoncancel">Cancel</button>';
                document.getElementById('qpdialogtextarea').focus();
            break;
	}
        
    };
	 
    parameters._hideDialog = function()
    {
        dialogoverlay.style.display = "none";
	dialogbox.style.display     = "none";
	document.getElementById('dialogboxbody').innerHTML = '';
	document.getElementById('dialogboxfoot').innerHTML = '';
    };	

    // Bind the parameters class to the osweb namespace.
    osweb.parameters = parameters;
}());

/*
 * Definition of the class session.
 */

(function() 
{
    function parser() 
    {
	throw "The class parser cannot be instantiated!";
    }

    // Definition of private properties.
    parser._ast_tree      = null;    
    parser._current_node  = null;
    parser._inline_script = null;
    parser._status        = 0;                      
                
    /*
     * Definition of private methods.   
     */

    parser._prepare = function(pScript)
    {
        if (pScript !== '')
        {
            var locations = false;
            var parseFn   = filbert_loose.parse_dammit;
            var ranges    = false;
        		
	    try 
	    {
                var code  = pScript;
           	var ast   = parseFn(code, { locations: locations, ranges: ranges });
        
	        return ast;
    	    }
       	    catch (e) 
            {
        	console.log('error');
        	console.log(e.toString());
    	 	
                return null;
            }
        }
	else
	{
            return null;
        }	   	
    };

    /*
     * Definition of private methods - AST parsing   
     */

    parser._node_identifier = function(pNode, pType)
    {
        // Select te type of identifier to process.
        switch (pType) 
        {   
            case 'object':
                // Process the object 
                switch(pNode.name)
                {
                    case 'canvas': 
                        return {'object': new osweb.canvas()};
                    break;    
                    case 'exp':
                        // Return the experiment object as exp.
                        return {'object': osweb.runner.experiment};
                    break;    
                    case 'mouse': 
                        // Create a osweb canvas object.
                        return {'object': new osweb.mouse()};
                    break;    
                    case 'self':
                        // Return the experiment object as self.
                        return {'object': osweb.runner.experiment};
                    break;    
                    case 'var': 
                        return {'object': osweb.runner.experiment.vars};
                    break;    
                    default:
                        // Check if the variable exists.
                        if (window[pNode.name] === undefined) 
                        {
                            // Create the variable with null setting.
                            window[pNode.name] = null;
                        
                            // Return the window variable.                
                            return {'object': pNode.name };
                        }
                        else
                        {
                            return {'object': window[pNode.name]};
                        }
                }            
            break;
            case 'property':
                return {'property': pNode.name};
            break;
            case 'value':
                return window[pNode.name];
            break    
        }    
    };

    parser._node_binary_expression = function(pNode)
    {
        // Process left node.
        var tmp_left;
        switch (pNode.left.type)  
        {
            case 'Identifier':
                tmp_left = this._node_identifier(pNode.left, 'value');
            break;    
            case 'Literal': 
                tmp_left = pNode.left.value;  
            break;    
        }

        // Process right node.
        var tmp_right;
        switch (pNode.right.type)  
        {
            case 'Identifier':
                tmp_right = this._node_identifier(pNode.right, 'value');
            break;    
            case 'Literal': 
                tmp_right = pNode.right.value;  
            break;    
        }

        // Process operator
        switch (pNode.operator)
        {
            case '-': 
                // Substraction.
                return tmp_left - tmp_right;
            case '%': 
                // Concatenation.    
                return tmp_left + tmp_right;
            break;        
        }
    };

    parser._node_call_expression = function(pNode)
    {
       // console.log('node_call_expression');

        // Process arguments.
        var tmp_arguments = [];
        for (var i = 0; i < pNode.arguments.length;i++)
        {
            // Process each argument depending on its type. 
            switch (pNode.arguments[i].type)
            {
                case 'BinaryExpression': 
                    tmp_arguments.push(this._node_binary_expression(pNode.arguments[i]));
                break;    
                case 'Literal': 
                    tmp_arguments.push(pNode.arguments[i].value);
                break;    
            } 
        }
        
        // Process caller.
        switch (pNode.callee.type)
        {
            case 'Identifier': 
                var tmp_callee  = this._node_identifier(pNode.callee, 'object');
                var call_result = tmp_callee.object;
            break;    
            case 'MemberExpression': 
                var tmp_callee = this._node_member_expression(pNode.callee);

                // Check if the given object is defined as string name or as an object itself.
                if (typeof tmp_callee.object === 'string')
                {
                    if (tmp_callee.object === 'function')
                    {
                        // Ugly hack for parameters.
                        switch (tmp_arguments.length)
                        {
                            case 0: var call_result = window[tmp_callee.property]();
                            break;        
                            case 1: var call_result = window[tmp_callee.property](tmp_arguments[0]);
                            break;        
                            case 2: var call_result = window[tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                            break;        
                        }    
                    } 
                    else
                    {    
                        // Ugly hack for parameters.
                        switch (tmp_arguments.length)
                        {
                            case 0: var call_result = window[tmp_callee.object][tmp_callee.property]();
                            break;        
                            case 1: var call_result = window[tmp_callee.object][tmp_callee.property](tmp_arguments[0]);
                            break;        
                            case 2: var call_result = window[tmp_callee.object][tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                            break;        
                        }    
                    }
                }    
                else
                {
                    switch (tmp_arguments.length)
                    {
                        case 0: var call_result = tmp_callee.object[tmp_callee.property]();
                        break;
                        case 1: var call_result = tmp_callee.object[tmp_callee.property](tmp_arguments[0]);
                        break;
                        case 2: var call_result = tmp_callee.object[tmp_callee.property](tmp_arguments[0],tmp_arguments[1]);
                        break;
                    }       
                }    
            break;    
        }
   
        if (tmp_callee.property != 'sleep')
        {
            // Temporal for loop testing.
            if (typeof tmp_callee.object === 'function')
            {    
                return tmp_callee.object(tmp_arguments[0],tmp_arguments[1]);
            }
            else
            {    
                // Return result.
                return call_result;
            }    
        }    
        else
        {
            return 'sleep';
        }    
    };

    parser._node_member_expression = function(pNode)
    {
        // Process the object leaf.
        switch (pNode.object.type)
        {
            case 'Identifier':
                var tmp_object = this._node_identifier(pNode.object, 'object');
            break;    
            case 'MemberExpression':
                var tmp_object = this._node_member_expression(pNode.object);
                if (tmp_object.property == 'functions')
                {
                    tmp_object.object = 'function';
                }  
            break;    
        }
     
        // Process the property leaf.
        switch (pNode.property.type)
        {
            case 'Identifier':
                var tmp_property = this._node_identifier(pNode.property,'property');
            break;    
        }

        // Return the function result.
        return {'object': tmp_object.object, 'property': tmp_property.property};
    };


    parser._node_block_expression = function(pNode)
    {
        console.log('node_block_expression');
        console.log(pNode);
        
        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };    

    parser._node_expression_statement = function(pNode)
    {
        // Process the expression
        switch (pNode.expression.type)
        {
            case 'CallExpression':
                var tmp_expression = this._node_call_expression(pNode.expression);    
            break;
        } 

        if (tmp_expression != 'sleep')
        {
            // Set parent node.
            this._current_node = this._current_node.parent;

            // Set the parser status.
            this._process_node();
        }
    };

    parser._node_variable_declarator = function(pNode)
    {
        //console.log('node_variable_declarator');
        //console.log(pNode);
        
        // Process the id lead.
        switch (pNode.id.type)
        {
            case 'Identifier':
                // Process id as identifier.
                var tmp_id = this._node_identifier(pNode.id, 'object');
            break;    
        }

        // Process the init leaf.
        switch (pNode.init.type)
        {
            case 'BinaryExpression': 
                // Process init as call expression.
                var tmp_init = this._node_binary_expression(pNode.init);
            break;    
            case 'CallExpression':
                // Process init as call expression.
                var tmp_init = this._node_call_expression(pNode.init, true);    
            break;    
        }

        // Process declaration.
        if (typeof tmp_id.object === 'string')
        {
            window[tmp_id.object] = tmp_init;
        } 
        else
        {
            console.log('b');
        }   

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Set the parser status.
        this._process_node();
    };

    parser._process_node = function()
    {
	//console.log(this._current_node);
        // Set the parser status.
        switch (this._current_node.type)
	{
            case 'Program':
		if (this._current_node.index < this._current_node.body.length)		
		{
                    this._current_node.index++;
                    this._current_node.body[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.body[this._current_node.index - 1];

                    // Set the parser status.
                    this._process_node();
                }
                else
                {
                    // End the parser.
                    this._status = 2;
        
                    // Complete the inline item.    
                    parser._inline_script.complete();
                } 
            break; 
            case 'BlockStatement':
                // Process a variable declarator.
                this._node_block_expression(this._current_node);
            break;		
            case 'EmptyStatement':
                // Set parent node.
                this._current_node = this._current_node.parent;

                // Set the parser status.
                this._process_node();
            break
            case 'ExpressionStatement':
                // Process a variable declarator.
                this._node_expression_statement(this._current_node);
            break;		
            case 'VariableDeclaration':
                // Process a variable declarator.
                this._node_variable_declarator(this._current_node.declarations[0]);
            break; 
        }
    };

    parser._runstatement = function(pNode)
    {
        // Call the expression statement en return the value.       
        return this._node_call_expression(pNode.expression);
    };
    
    parser._run = function(pInline_script, pAst_tree)
    {
	// Set the ast_tree. 
	this._inline_script = pInline_script;
	
	// Set the programm node.
	this._current_node        = pAst_tree;
	this._current_node.parent = null;
	this._current_node.index  = 0;
	this._status              = 1;
        
    	// Process the next node. 
	osweb.parser._process_node();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}()); 

/*
 * Definition of the class session.
 */

(function() 
{
    function session() 
    {
    	throw "The class session cannot be instantiated!";
    }

    /*
     * Definition of session related methods.   
     */

    session._initialize = function()
    {
    	// Update the loader text.
    	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_008);
	
    	// Get the session information.
	this._getSessionInformation();
    };

    /*
     * Definition of session related methods.   
     */

    session._getSessionInformation = function()
    {
    	// Get the session information from the client system
    	this.date    = new Date();
	this.session = 
        {
            "browser": 
            {
                "codename"        : navigator.appCodeName,
                "name"            : navigator.appName,
                "version"         : navigator.appVersion
            },
            "date": 
            {
                "startdate"       : ('0' + this.date.getDate()).slice(-2) + '-' + ('0' + this.date.getMonth()).slice(-2) + '-' + ('0' + this.date.getFullYear()).slice(-2),
                "starttime"       : ('0' + this.date.getHours()).slice(-2) + ':' + ('0' + this.date.getMinutes()).slice(-2) + ':' + ('0' + this.date.getSeconds()).slice(-2),
                "startdateUTC"    : ('0' + this.date.getUTCDate()).slice(-2) + '-' + ('0' + this.date.getUTCMonth()).slice(-2) + '-' + ('0' + this.date.getUTCFullYear()).slice(-2)
            },
            "experiment": 
            {
		"debug"		  : 0,
                "parameters"	  : 0,
		"pilot"           : 0,
                "taskname"        : 0,
                "taskversion"     : 0
            },
            "screen":
            {
                "availableHeight" : screen.availHeight,
                "availableWidth"  : screen.availWidth,
                "colorDepth"      : screen.colorDepth,
                "height"          : screen.height,
                "outerheight"     : window.outerheight,
                "outerwidth"      : window.outerwidth,
                "pixelDepth"      : screen.pixelDepth,
                "screenX"         : window.screenX,
                "screenY"         : window.screenY,
                "width"           : screen.width
            },
            "system": 
            {
                "os"              : navigator.platform
            }
        };
    };

    // Bind the session class to the osweb namespace.
    osweb.session = session;
}()); 

/*
 * Definition of the class runner.
 */

(function() 
{
    function runner() 
    {
    	throw "The class runner cannot be instantiated!";
    };

    // Show library name and library version number in the console.
    console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);	
    console.log(osweb);

    // Definition of private properties.
    runner._canvas        = null;           // Canvas on which the experiment is shown.
    runner._qualtrics     = null;           // Link to the qualtrics interface (optional)
    runner._stage	  = null;           // Links to the stage object (CreateJS).

    // Definition of public properties.
    runner.debug          = false;          // Debug toggle.
    runner.experiment     = null;           // The root experiment object to run.           
    runner.onFinished	  = null;           // Event triggered on finishing the experiment.
    runner.screenIntro    = true;           // Show introscreen toggle.
    runner.screenClick    = true;           // Show clickscreen toggle
    runner.script         = null;           // Container for the JSON script definition of the experiment.
    runner.scriptID       = 0;              // Id used when retrieving the script from the database.
    runner.scriptURL      = '';             // Path pointing to the AMFPHP database files.
    runner.session	  = null;           // Container for the JSON session information.
    
    /*
     * Definition of the private setup methods.      
     */

    runner._setupContent = function(pContent)
    {
    	// Check if the experiment container is defined.                     
	if (typeof pContent !== "undefined") 
	{
            // Get the canvas from the DOM Element tree.
            this._canvas = (typeof pContent === 'string') ? document.getElementById(pContent) : pContent; 		
		
            // Set the stage object (easelJS). 
            this._stage                    = new createjs.Stage(this._canvas);
            this._stage.snapToPixelEnabled = true;
            this._stage.regX               = -.5;
            this._stage.regY 		   = -.5;
		
            // Build the initialization screen.
            this._setupIntroScreen();
	}
	else
	{
            osweb.debug.addError(osweb.constants.ERROR_002);
	}
    };

    runner._setupContext = function(pContext)
    {
	// Check if the script parameter is defined.                        
	if (typeof pContext !== "undefined") 
	{
            // Set the context container.
            this._context = pContext;
			
            // Initialize the context parameters.
            this.debug        = (typeof this._context.debug       !== 'undefined') ? this._context.debug       : false; 
            this.file         = (typeof this._context.file        !== 'undefined') ? this._context.file        : null;
            this.onFinished   = (typeof this._context.onFinished  !== 'undefined') ? this._context.onFinished  : null;
            this.screenClick  = (typeof this._context.screenClick !== 'undefined') ? this._context.screenClick : true;				      
            this.screenIntro  = (typeof this._context.screenIntro !== 'undefined') ? this._context.screenIntro : true; 
            this.script       = (typeof this._context.script      !== 'undefined') ? this._context.script      : null;      
            this.scriptID     = (typeof this._context.scriptID    !== 'undefined') ? this._context.scriptID    : 0;         
            this.scriptURL    = (typeof this._context.scriptURL   !== 'undefined') ? this._context.scriptURL   : '';		 
            this.session      = (typeof this._context.session     !== 'undefined') ? this._context.session     : null;
					
            // Check if an osexp script is given as parameter.                            
            if (this.script !== null) 
            {	
                // Start building the experiment structure.      
		this._buildExperiment();
            }
            // Check if an osexp file is given as parameter. 
            else if (this.file !== null)
            {
                this._setupScriptFromFile();
            }	
            else
            {
                // Retrieve the script from an external location.
		this._setupScriptFromDatabase();
            }
	}
	else
	{
            osweb.debug.addError(osweb.constants.ERROR_003);
	}
    };

    runner._setupScriptFromFile = function()
    {
        // Check for binary or text file definition.
        if (this.file.substring(0,3) == '---')
        {
            this.script = String(this.file);
        } 
        else
        {
            // Decompress the gizp file and splitt the tar result.	
            GZip.loadlocal(this.file, function(h) 
            {
                var tar = new TarGZ;
                tar.parseTar(h.data.join(''));
                tar.files.forEach(this.setupScriptFromFileResult.bind(this)); 
            }.bind(this), this.setupScriptFromFileProgress, this.setupScriptFromFileAlert);
        }    
        
        // Start building the experiment structure.      
	this._buildExperiment();
    };

    runner.setupScriptFromFileAlert = function()
    {
    };

    runner.setupScriptFromFileProgress = function()
    {
    };

    runner.setupScriptFromFileResult = function(pFile)
    {
	// Check if the file is the scriptfile.
    	if (pFile.filename === 'script.opensesame') 
	{
            // Create the script.
            this.script = String(pFile.data);
   	}
	else if ((pFile.data !== null) && (pFile.data !== ''))
	{
            // Create a file pool element.
            osweb.pool.add_from_local_source(pFile);			
	}
    };

    runner._setupScriptFromDatabase = function()
    {
	// Check if the URL and ID is propertly defined.
       	if ((this.scriptID >= 0) && (this.scriptURL !== ''))
       	{
            var url        = this.scriptURL + '/php/index.php?/ajax/group/get_status';
            var parameters = {group_id: 99, task_number: this.scriptID};
		
            new Ajax.Request(url,
            {
            	parameters: parameters,
		onCreate: function(response) 
		{
                    var t = response.transport;
                    t.setRequestHeader = t.setRequestHeader.wrap(function(original, k, v) 
                    {
			if (/^(accept|accept-language|content-language)$/i.test(k))
                            return original(k, v);
			if (/^content-type$/i.test(k) &&
                            /^(application\/x-www-form-urlencoded|multipart\/form-data|text\/plain)(;.+)?$/i.test(v))
                            return original(k, v);
			return;
                    });
		},
		onSuccess: function(transport) 
		{
                    // Process the response
                    if (transport.responseText)
                    {
                        // Retrieve the response text.
			var jsonresponse = JSON.parse(transport.responseText);
					
			// Check if the task is available.
			if (jsonresponse.task_available === '1') 
			{
                            // Set the script parameter.
                            this.script = jsonresponse.data_available;
                            this.files  = jsonresponse.file_available.split('\r\n');    
                                    
                            // Create a file pool element.
                            osweb.pool.add_from_server_source(this.scriptURL + '/user/4/', this.files);			
                        }
			else
			{
                            // Show erorr message within the concole.
                            osweb.debug.addError(osweb.constants.ERROR_007);
			}
                    }	
                    else
                    {
			// Show erorr message within the concole.
			osweb.debug.addError(osweb.constants.ERROR_006);
                    }
		}.bind(this),
		onFailure: function()
		{
                    // Show erorr message within the concole.
                    osweb.debug.addError(osweb.constants.ERROR_005);
		}.bind(this) 
            }); 
	}
	else
	{
            // Show erorr message within the concole.
            osweb.debug.addError(osweb.constants.ERROR_004);
	} 
    };

    /*
     * Definition of the private introscreen methods.      
     */

    runner._setupIntroScreen =  function() 
    {
    	// Set the introscreen elements.
	if (this.screenIntro === true)
	{
            this._introScreen  = new createjs.Shape();
            this._introScreen.graphics.beginFill('#000000').drawRect(0,0,this._stage.width,this._stage.height);
            this._introLine    = new createjs.Shape();
            this._introLine.graphics.beginFill('#AAAAAA').drawRect(200,155,400,1);
            this._introText1   = new createjs.Text('OS', "24px bold Times", "#FF0000");
            this._introText1.x = 200;
            this._introText1.y = 135;
            this._introText2   = new createjs.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, "14px Arial", "#FFFFFF");
            this._introText2.x = 231;
            this._introText2.y = 142;
            this._introText3   = new createjs.Text(osweb.constants.MESSAGE_003,"12px Arial", "#FFFFFF");
            this._introText3.x = 200;
            this._introText3.y = 168;
            this._stage.addChild(this._introScreen,this._introLine,this._introText1,this._introText2,this._introText3);
            this._stage.update();
	}
    };
	
    runner._clearIntroScreen = function()
    {
        // Update the introscreen elements.
	if (this.screenIntro === true)
	{
            this._stage.removeChild(this._introScreen,this._introLine,this._introText1,this._introText2,this._introText3);
            this._stage.update();
	}		
    };
	
    runner._updateIntroScreen = function(pText)
    {
	// Update the introscreen elements.
	if (this.screenIntro === true)
	{
            this._introText3.text = pText;
            this._stage.update();
	}		
    };

    /*
     * Definition of the private build methods.      
     */

    runner._buildExperiment = function()
    {
    	// Build the base experiment object.
	this.experiment = new osweb.experiment(null, 'test', this.script);
	
        // Create the global static object classes.
	window['items'] = osweb.item_store;
	window['pool']  = osweb.file_pole_store;
	window['vars']  = this.experiment.vars;
		
	// Create the global dynamic object classes.
	window['keyboard'] = osweb.keyboard_backend;

	// Pepare the experiment to run.
	this._prepare();
    };

    /*
     * Definition of private methods (prepare cycle).   
     */

    runner._prepare = function()
    {
	// Update inroscreen.
	this._updateIntroScreen(osweb.constants.MESSAGE_004);
		
	// Start the stimuli loader.
	osweb.parameters._initialize();
        osweb.functions._initialize();
	osweb.session._initialize();

        // Start the experiment.
        this._prepareParameters();
    };

    runner._prepareParameters = function()
    {
        // Update inroscreen.
	this._updateIntroScreen(osweb.constants.MESSAGE_005);

	// Check if items must be processed. 
	if (osweb.parameters._parameters.length > 0)
	{
		// Process the Parameters.        
   	    osweb.parameters._processParameters();
	}
	else
	{ 
            // Start the experiment.
   	    this._prepareStartScreen();
	}
    };

    runner._prepareStartScreen = function()
    {
        // Check if the experiment must be clicked to start.
        if (this.screenClick === true)
	{
            // Update inroscreen.
            this._updateIntroScreen(osweb.constants.MESSAGE_006);
		
            // Setup the mouse click response handler.
            var clickHandler = function(event)
            {
		// Remove the handler.
		this._canvas.removeEventListener("click",clickHandler);

		// Finalize the introscreen elements.
		this._clearIntroScreen();

                // Start the task.
		this._initialize();
            }.bind(this); 

            // Set the temporary mouse click.
            this._canvas.addEventListener("click", clickHandler,false);
	}
	else
	{
            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the runner.
            this._initialize(); 
	}
    };

    /*
     * Definition of private methods (run cycle).   
     */

    runner._initialize = function()
    {
	// Initialize the debugger. 
	osweb.debug._initialize();

        // Initialize the devices.
	osweb.events._initialize();

        // Prepare and execute the experiment item.
	this.experiment.prepare();
	this.experiment.run();
    };
	
    runner._finalize = function()
    {   
        // Finalize the devices.
    	osweb.events._finalize();
        
    	// Finalize the debugger. 
	osweb.debug._finalize();
        	
        // Set the cursor visibility to none (default).
        this._stage.canvas.style.cursor = "default";

        // Check if an event handler is attached.
	if (this.onFinished) 
	{
            // Execute.
            this.onFinished();
	}
    };

    /*
     * Definition of the public run methods.      
     */

    runner.run = function(pContent, pContext) 
    {
        // Initialize the content container.
	this._setupContent(pContent);

	// Initialize the context parameter
	this._setupContext(pContext);
    };

    // Bind the runner class to the osweb namespace.
    osweb.runner = runner;
}()); 
