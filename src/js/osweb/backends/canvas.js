
(function() {
// Definition of the class canvas.
    function canvas(experiment, auto_prepare) {
	// set the class public properties.
        this.auto_prepare = (typeof auto_prepare === 'undefined') ? true : auto_prepare;              // Set autoprepare toggle (not supported yet). 	
        this.experiment = (typeof experiment === 'undefined') ? osweb.runner.experiment : experiment; // Anchor to the experiment object.
		
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

