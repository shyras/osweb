
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
