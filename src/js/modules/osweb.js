/*
 * osweb 
 *  
 * An experiment research tool written in Javascript and HTML to be used in 
 * Qualtrics or other web-based tools. Based upon OpenSesame.         
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

console.log(document);
console.log(this);

this.osweb = this.osweb || {};

// Definition of osweb version constants. 
osweb.VERSION_NAME = 'osweb';
osweb.VERSION_NUMBER = '3.0.044 (01-08-2016)';

// Show library name and library version number in the console.
console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);
    
// Add replaceAll function to string prototype
String.prototype.replaceAll = function(str1, str2, ignore){
    return this.replace(
        new RegExp(
            str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),
            (ignore?"gi":"g")),
            (typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

// Definition of osweb class utility methods.
osweb.extendClass = function(sub_class, super_class) {
    function o() {
        this.constructor = sub_class;
    }
    o.prototype = super_class.prototype;
    return (sub_class.prototype = new o());
};

osweb.isClass = function(class_name) {
    // Return true if the classname is defined within the osweb namespace.
    return (this[class_name] !== undefined);
};

osweb.newItemClass = function(type, experiment, name, string) {
    // Create the element.
    var element = new this[type](experiment, name, string);

    // Set the type of the item.
    element.type = type;

    // Return the element
    return element;
};

osweb.newElementClass = function(type, sketchpad, string) {
    // Create the element.
    var element = new this[type](sketchpad, string);

    // Return the element
    return element;
};

osweb.newWidgetClass = function(type, form, variables) {
    // Create the element.
    var widget = new this[type](form, variables);

    // Return the element
    return widget;
};

osweb.promoteClass = function(sub_class, prefix) {
    var subP = sub_class.prototype,
        supP = (Object.getPrototypeOf && Object.getPrototypeOf(subP)) || subP.__proto__;
    if (supP) {
        subP[(prefix += "_") + "constructor"] = supP.constructor;
        for (var n in supP) {
            if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) {
                subP[prefix + n] = supP[n];
            }
        }
    }
    return sub_class;
};

(function() {
    // Definition of the class constants.
    function constants() {
        throw 'The class constants cannot be instantiated!';
    }

    // Definition of error constants. 
    constants.ERROR_001 = 'osweb has stopped running due to a fatal error.';
    constants.ERROR_002 = 'No content parameter specified.';
    constants.ERROR_003 = 'No context parameter specified.';
    constants.ERROR_004 = 'Invalid scriptID or scriptURL for retrieving script from external location.';
    constants.ERROR_005 = 'Failure to retrieve script from external location (Ajax call error).';
    constants.ERROR_006 = 'Failure to retrieve script from external location (database response error)';
    constants.ERROR_007 = 'Failure to retrieve script from external location (database retrieve error).';
    constants.ERROR_008 = 'Invalid script definition, parsing error.';
    constants.ERROR_009 = 'Unknown class definition within osweb script - ';

    // Definition of message constants. 
    constants.MESSAGE_001 = 'Os';
    constants.MESSAGE_002 = 'web - version ';
    constants.MESSAGE_003 = 'Retrieving stimuli files.';
    constants.MESSAGE_004 = 'Building stimuli files.';
    constants.MESSAGE_005 = 'Retrieving input parameters.';
    constants.MESSAGE_006 = 'Press with the mouse on this screen to continue.';
    constants.MESSAGE_007 = 'Warning: this method is not implemented in the current version of OsWeb - ';
    constants.MESSAGE_008 = 'Retrieving session information.';

    // Definition of general constants. 
    constants.RUNNER_NONE = 0;
    constants.RUNNER_READY = 1;
    constants.RUNNER_RUNNING = 2;
    constants.RUNNER_DONE = 3;
    constants.RUNNER_ERROR = 4;
    constants.RUNNER_BREAK = 5;
       
    
    constants.STATUS_NONE = 0; // Running status of an item.   
    constants.STATUS_BUILD = 1;
    constants.STATUS_INITIALIZE = 2;
    constants.STATUS_EXECUTE = 3;
    constants.STATUS_FINALIZE = 4;
    constants.PARSER_NONE = 0; // Running status of the parser.
    constants.PARSER_EXECUTE = 1;
    constants.STATUS_PENDING = 2;
    constants.STATUS_DONE = 3;
    constants.PRESSES_ONLY = 1; // Type of used collection mode.           
    constants.RELEASES_ONLY = 2;
    constants.PRESSES_AND_RELEASES = 3;
    constants.RESPONSE_NONE = 0; // Type of response used.
    constants.RESPONSE_DURATION = 1;
    constants.RESPONSE_KEYBOARD = 2;
    constants.RESPONSE_MOUSE = 3;
    constants.RESPONSE_SOUND = 4;
    constants.RESPONSE_AUTOKEYBOARD = 5;
    constants.RESPONSE_AUTOMOUSE = 6;
    constants.UPDATE_NONE = 0; // Item update status flag.
    constants.UPDATE_ONSET = 1;
    constants.UPDATE_OFFSET = 2;
    constants.SEQUENTIAL = 0; // Loop randomization type.
    constants.RANDOM = 1;
    constants.RANDOMREPLACEMENT = 2;

    // Bind the constants class to the osweb namespace.
    osweb.constants = constants;
}());
(function() {
    // Definition of the class canvas.
    function canvas(experiment, auto_prepare) {
        // set the class public properties.
        this.auto_prepare = (typeof auto_prepare === 'undefined') ? true : auto_prepare; // Set autoprepare toggle (not supported yet). 	
        this.experiment = (typeof experiment === 'undefined') ? osweb.runner.experiment : experiment; // Anchor to the experiment object.

        // Initialize a new styles object to store the default styles in.
        this.styles = new osweb.Styles();

        // Set the public properties. 
        this.styles.background_color = this.experiment.vars.background; // Backgropund color of canvas.     
        this.styles.bidi = (this.experiment.vars.bidi === 'yes'); // If true bidi mode is enabled.
       
        // Stimulus specific styles
        this.styles.color = this.experiment.vars.foregound?this.experiment.vars.foregound:'white'; // Foreground color of canvas.
        this.styles.fill = false; // If true fill mode is used.
        this.styles.font_bold = (this.experiment.vars.font_bold === 'yes'); // If true font style bold is enabled.
        this.styles.font_family = (this.experiment.vars.font_family); // Family name of the font used.
        this.styles.font_italic = (this.experiment.vars.font_italic === 'yes'); // If true font style italic is enabled.
        this.styles.font_size = (this.experiment.vars.font_size); // Size of the font in pixels.
        this.styles.font_underline = (this.experiment.vars.font_underline === 'yes'); // If true font style underline is enabled.
        this.styles.penwidth = 1; // Default penwidth for drawing shapes. 

        this.html = true; // If true html is used (not supported yet).

        // Set the private properties.  
        this._container = new createjs.Container(); // EASELJS: Container which holds the shapes
        this._font_string = 'bold 18px Courier New'; // EASELJS: Default font definition string.
        this._height = osweb.runner._canvas.height; // Height of the HTML canvas used for drawing.
        this._width = osweb.runner._canvas.width; // Width of the HTML canvas used for drawing.
    };

    // Extend the class from its base class.
    var p = canvas.prototype;

    // Definition of public properties. 
    p.auto_prepare = false;
    p.experiment = null;
    p.uniform_coordinates = false;
    
    /**
     * Decorator function for applying styles for only the current drawing
     * operation
     * @param  {function} target_func The drawing function
     * @return {various}             Whatever the passed drawing function returns.
     */
    p._configurable = function(target_func){
        return function(){
            // Check if a style object was passed by iterating through the 
            // arguments and check if one is an instance of Styles
            for(var i=0, arg; i < arguments.length; i++){
                arg = arguments[i];
                if(arg instanceof osweb.Styles){
                    // store the style object
                    var styles_pos = i;
                    break;
                }
            };

            // If a styles object was found, activate it.
            if(styles_pos !== undefined){
                // Save original styles
                var orig_styles = this.styles;
                // Apply the style and remove the style object from the 
                // arguments list.
                this.styles = Array.prototype.splice.apply(arguments, 
                    [styles_pos, 1])[0];

                // Make sure all required style definitions are present in the 
                // current styles object, and copy those who aren't from the 
                // orig_styles object.
                for (var attrname in orig_styles){ 
                    if(!this.styles.hasOwnProperty(attrname)){
                        this.styles[attrname] = orig_styles[attrname];
                    } 
                }
            }

            // Call the original target function
            res = target_func.apply(this, arguments);
            //console.log(res);

            // Reset original styles if they were changed.
            if(orig_styles !== undefined){
                this.styles = orig_styles;
            }
            // Return the result of the original drawing function
            return res;
        }
    }

    // Definition of private methods. 

    p._arrow_shape = function(sx, sy, ex, ey, body_width, body_length, head_width) {
        // Length
        var d = Math.sqrt(Math.pow(ey - sy, 2) + Math.pow(sx - ex, 2));
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

    //!!!!!!!!!!!!!!!!!!!!!!!
    // Is the function below even required in a browser? I think it already has all 
    // these values internally representend. -Daniel

    p._color = function(colour) {
        // Method to convert color names and hex values to rgb object (used in gabor and noise).
        var colours = {
            "aliceblue": "#f0f8ff",
            "antiquewhite": "#faebd7",
            "aqua": "#00ffff",
            "aquamarine": "#7fffd4",
            "azure": "#f0ffff",
            "beige": "#f5f5dc",
            "bisque": "#ffe4c4",
            "black": "#000000",
            "blanchedalmond": "#ffebcd",
            "blue": "#0000ff",
            "blueviolet": "#8a2be2",
            "brown": "#a52a2a",
            "burlywood": "#deb887",
            "cadetblue": "#5f9ea0",
            "chartreuse": "#7fff00",
            "chocolate": "#d2691e",
            "coral": "#ff7f50",
            "cornflowerblue": "#6495ed",
            "cornsilk": "#fff8dc",
            "crimson": "#dc143c",
            "cyan": "#00ffff",
            "darkblue": "#00008b",
            "darkcyan": "#008b8b",
            "darkgoldenrod": "#b8860b",
            "darkgray": "#a9a9a9",
            "darkgreen": "#006400",
            "darkkhaki": "#bdb76b",
            "darkmagenta": "#8b008b",
            "darkolivegreen": "#556b2f",
            "darkorange": "#ff8c00",
            "darkorchid": "#9932cc",
            "darkred": "#8b0000",
            "darksalmon": "#e9967a",
            "darkseagreen": "#8fbc8f",
            "darkslateblue": "#483d8b",
            "darkslategray": "#2f4f4f",
            "darkturquoise": "#00ced1",
            "darkviolet": "#9400d3",
            "deeppink": "#ff1493",
            "deepskyblue": "#00bfff",
            "dimgray": "#696969",
            "dodgerblue": "#1e90ff",
            "firebrick": "#b22222",
            "floralwhite": "#fffaf0",
            "forestgreen": "#228b22",
            "fuchsia": "#ff00ff",
            "gainsboro": "#dcdcdc",
            "ghostwhite": "#f8f8ff",
            "gold": "#ffd700",
            "goldenrod": "#daa520",
            "gray": "#808080",
            "green": "#008000",
            "greenyellow": "#adff2f",
            "honeydew": "#f0fff0",
            "hotpink": "#ff69b4",
            "indianred ": "#cd5c5c",
            "indigo": "#4b0082",
            "ivory": "#fffff0",
            "khaki": "#f0e68c",
            "lavender": "#e6e6fa",
            "lavenderblush": "#fff0f5",
            "lawngreen": "#7cfc00",
            "lemonchiffon": "#fffacd",
            "lightblue": "#add8e6",
            "lightcoral": "#f08080",
            "lightcyan": "#e0ffff",
            "lightgoldenrodyellow": "#fafad2",
            "lightgrey": "#d3d3d3",
            "lightgreen": "#90ee90",
            "lightpink": "#ffb6c1",
            "lightsalmon": "#ffa07a",
            "lightseagreen": "#20b2aa",
            "lightskyblue": "#87cefa",
            "lightslategray": "#778899",
            "lightsteelblue": "#b0c4de",
            "lightyellow": "#ffffe0",
            "lime": "#00ff00",
            "limegreen": "#32cd32",
            "linen": "#faf0e6",
            "magenta": "#ff00ff",
            "maroon": "#800000",
            "mediumaquamarine": "#66cdaa",
            "mediumblue": "#0000cd",
            "mediumorchid": "#ba55d3",
            "mediumpurple": "#9370d8",
            "mediumseagreen": "#3cb371",
            "mediumslateblue": "#7b68ee",
            "mediumspringgreen": "#00fa9a",
            "mediumturquoise": "#48d1cc",
            "mediumvioletred": "#c71585",
            "midnightblue": "#191970",
            "mintcream": "#f5fffa",
            "mistyrose": "#ffe4e1",
            "moccasin": "#ffe4b5",
            "navajowhite": "#ffdead",
            "navy": "#000080",
            "oldlace": "#fdf5e6",
            "olive": "#808000",
            "olivedrab": "#6b8e23",
            "orange": "#ffa500",
            "orangered": "#ff4500",
            "orchid": "#da70d6",
            "palegoldenrod": "#eee8aa",
            "palegreen": "#98fb98",
            "paleturquoise": "#afeeee",
            "palevioletred": "#d87093",
            "papayawhip": "#ffefd5",
            "peachpuff": "#ffdab9",
            "peru": "#cd853f",
            "pink": "#ffc0cb",
            "plum": "#dda0dd",
            "powderblue": "#b0e0e6",
            "purple": "#800080",
            "red": "#ff0000",
            "rosybrown": "#bc8f8f",
            "royalblue": "#4169e1",
            "saddlebrown": "#8b4513",
            "salmon": "#fa8072",
            "sandybrown": "#f4a460",
            "seagreen": "#2e8b57",
            "seashell": "#fff5ee",
            "sienna": "#a0522d",
            "silver": "#c0c0c0",
            "skyblue": "#87ceeb",
            "slateblue": "#6a5acd",
            "slategray": "#708090",
            "snow": "#fffafa",
            "springgreen": "#00ff7f",
            "steelblue": "#4682b4",
            "tan": "#d2b48c",
            "teal": "#008080",
            "thistle": "#d8bfd8",
            "tomato": "#ff6347",
            "turquoise": "#40e0d0",
            "violet": "#ee82ee",
            "wheat": "#f5deb3",
            "white": "#ffffff",
            "whitesmoke": "#f5f5f5",
            "yellow": "#ffff00",
            "yellowgreen": "#9acd32"
        };

        if (typeof colours[colour.toLowerCase()] !== 'undefined') {
            var colour = colours[colour.toLowerCase()];
        }

        return this._hexToRgb(colour);
    };

    p._hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    p._match_env = function(env) {
        if ((env === 'c') || (env === 'circular') || (env === 'round')) {
            return 'c';
        } else if ((env === 'g') || (env === 'gaussian') || (env === 'gauss') || (env === 'normal') || (env === 'rect') || (env === 'square')) {
            return 'g';
        } else if ((env === 'rectangular') || (env === 'rectangle')) {
            return 'r';
        } else if ((env === 'l') || (env === 'linear') || (env === 'lin') || (env === 'ln')) {
            return 'l';
        } else {
            return 'g';
        }
    };

    /**
     * Checks if the supplied string contains HTML markup
     * @param  {string} str The string to check
     * @return {boolean}     True if HTML markup was found, false if not.
     */
    p._containsHTML = function(str){
        var doc = new DOMParser().parseFromString(str, "text/html");
        return [].slice.call(doc.body.childNodes).some(
            function(node){ return node.nodeType === 1} );
    }

    /**
     * Creates a EaselJS interpretable font string
     * @return {string} the font string
     */
    p._create_font_string = function(){
        var font_bold = (this.styles.font_bold === true) ? 'bold ' : '';
        var font_italic = (this.styles.font_italic === true) ? 'italic ' : '';
        var font_underline = (this.styles.underline === true) ? 'underline ' : '';

        return font_bold + font_italic + font_underline + this.styles.font_size 
            + 'px' + ' ' + this.styles.font_family;
    }

    /**
     * Creates a div element for the supplied text.
     *
     * this.styles will be used to determine the appearance 
     * @param  {string} text   The text to render
     * @param  {string} center "1" uses the center point of the text area as the reference point
     * in the coordinate system, "0" the top-left point
     * @return {HTMLDivElement} The resulting div element
     */
    p._create_div_for_text = function(text, center){
        // Account for ommission of center argument. Default to 1 if ommitted.
        var center = typeof(center)=="undefined"?1:center;
        // Already create some style strings.
        var font_bold = (this.styles.font_bold === true) ? 'bold ' : '';
        var font_italic = (this.styles.font_italic === true) ? 'italic ' : '';
        var font_underline = (this.styles.underline === true) ? 'underline ' : '';

        // Create DOM element
        var container = document.createElement("div");
        // HTML in svg needs to be valid XML/XHTML with a namespace
        container.setAttribute("xmlns", container.namespaceURI);
        // Set style variables following to this.styles
        container.style.color = this.styles.color;
        container.style.fontSize = this.styles.font_size + "px";
        container.style.width = "auto";
        container.style.height = "auto";
        container.style.maxWidth = this._width;
        container.style.maxHeight = this._height;
        // // If center variable == 1, center the text too.
        if(center == "1"){
            container.style.textAlign = "center";
        }
        // Set the correct font
        if(this.styles.font_family){
            // Check for spaces in font names
            if(this.styles.font_family.indexOf(" ") != -1){
                // Encapsulate in quotes if font name contains spaces (e.g.
                // "Times New Roman")
                font_str = "'" + this.styles.font_family + "'";
            }else{
                font_str = this.styles.font_family;
            }
            container.style.fontFamily = this.styles.font_family + ', Verdana, sans-serif';
        }
        if(font_bold){ 
            container.style.fontWeight = font_bold;
        }
        if(font_italic){ 
            container.style.fontStyle = font_italic;
        }
        if(font_underline){ 
            font_underline += 'text-decoration: ' + font_underline + ';'
            container.style.textDecoration = font_underline;
        }

        // Set the text of the div element
        container.innerHTML = this.nl2br(text);
        return container;
    }

    // Definition of public methods.

    p.arrow = p._configurable(function(sx, sy, ex, ey, body_width, body_length, head_width) {
        // Calculate coordinate points for the arrow.
        var points = this._arrow_shape(sx, sy, ex, ey, body_width, body_length, head_width);

        // Draw the arrow as a polygon.
        this.polygon(points);
    });

    p.circle = p._configurable(function(x, y, r) {
        var shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(this.styles.penwidth);
        shape.graphics.beginStroke(this.styles.color);
        if (this.styles.fill == 1) {
            shape.graphics.beginFill(this.styles.color);
        }
        shape.graphics.drawCircle(x, y, r);

        // Add the line item to container.
        this._container.addChild(shape);
    });

    p.clear = function(backround_color) {
        // Remove the container from the stage object.
        osweb.runner._stage.removeChild(this._container);

        // Remove the children from the container.
        this._container.removeAllChildren();
    };

    p.close_display = function(experiment) {
        // Close the display (Needed in osweb?)
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas.close_display().');
    };

    /**
     * Copies the contents of the passed canvas onto current one.
     * @param  {osweb.canvas} canvas The source canvas to copy
     * @return {void}
     */
    p.copy = function(canvas) {        
        this._container = canvas._container.clone(true);
    };

    p.ellipse = p._configurable(function(x, y, w, h) {
        var shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(this.styles.penwidth);
        shape.graphics.beginStroke(this.styles.color);
        if (this.styles.fill == 1) {
            shape.graphics.beginFill(this.styles.color);
        }
        shape.graphics.drawEllipse(x, y, w, h);

        // Add the text item to the parten frame.
        this._container.addChild(shape);
    });

    p.fixdot = p._configurable(function(x, y, style) {
        // Check the color and style arguments.      
        style = (typeof style === 'undefined') ? 'default' : style;
        color = this.styles.color;
        bgcolor = this.styles.background_color;

        if (typeof x === 'undefined') {
            if (this.uniform_coordinates === true) {
                x = 0;
            } else {
                x = this._width / 2;
            }
        }
        if (typeof y === 'undefined') {
            if (this.uniform_coordinates === true) {
                y = 0;
            } else {
                y = this._height / 2;
            }
        }

        var s = 4;
        var h = 2;
        if (style.indexOf('large') !== -1) {
            s = 16;
        } else if ((style.indexOf('medium') !== -1) || (style === 'default')) {
            s = 8;
        } else if (style.indexOf('small') !== -1) {
            s = 4;
        } else {
            osweb.debug.addError('Unknown style: ' + style);
        }

        var styles = new osweb.Styles()
        if ((style.indexOf('open') !== -1) || (style === 'default')) {
            styles.fill = 1;
            styles.color = color;
            this.ellipse(x - s, y - s, 2 * s, 2 * s, 1, styles);
            styles.color = bgcolor;
            this.ellipse(x - h, y - h, 2 * h, 2 * h, 1, styles);
        } else if (style.indexOf('filled') !== -1) {
            styles.fill = 1;
            styles.color = color;
            this.ellipse(x - s, y - s, 2 * s, 2 * s, 1, styles);
        } else if (style.indexOf('cross') !== -1) {
            styles.penwidth = 1;
            styles.color = color;
            this.line(x, y - s, x, y + s, styles);
            this.line(x - s, y, x + s, y, styles);
        } else {
            osweb.debug.addError('Unknown style: ' + style);
        }
    });

    p.gabor = function(x, y, orient, freq, env, size, stdev, phase, color1, color2, bgmode) {
        // Returns a surface containing a Gabor patch. 
        env = this._match_env(env);

        /* # Generating a Gabor patch takes quite some time, so keep
    	# a cache of previously generated Gabor patches to speed up
    	# the process.
    	global canvas_cache
    	key = u"gabor_%s_%s_%s_%s_%s_%s_%s_%s_%s" % (orient, freq, env, size,
    		stdev, phase, col1, col2, bgmode)
    	if key in canvas_cache
    		return canvas_cache[key] */

        // Create a temporary canvas to make an image data array.        
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var px = ctx.getImageData(0, 0, size, size);

        // Conver the orientation to radians.
        orient = (orient * Math.PI / 180);
        color1 = this._color(color1);
        color2 = this._color(color2);

        // rx and ry reflect the real coordinates in the target image
        for (var rx = 0; rx < size; rx++) {
            for (var ry = 0; ry < size; ry++) {
                // Distance from the center
                var dx = rx - 0.5 * size;
                var dy = ry - 0.5 * size;

                // Get the coordinates (x, y) in the unrotated Gabor patch.
                var t = Math.atan2(dy, dx) + orient;
                var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                var ux = r * Math.cos(t);
                var uy = r * Math.sin(t);

                // Get the amplitude without the envelope (0 .. 1).
                var amp = 0.5 + 0.5 * Math.cos(2.0 * Math.PI * (ux * freq + phase));

                // The envelope adjustment
                if (env === 'g') {
                    f = Math.exp(Math.pow(-0.5 * (ux / stdev), 2) - Math.pow(0.5 * (uy / stdev), 2));
                } else if (env === 'l') {
                    f = Math.max(0, (0.5 * size - r) / (0.5 * size));
                } else if (env === 'c') {
                    if (r > 0.5 * size) {
                        f = 0.0;
                    } else {
                        f = 1.0;
                    }
                } else {
                    f = 1.0;
                }

                // Apply the envelope
                if (bgmode === 'avg') {
                    amp = amp * f + 0.5 * (1.0 - f);
                } else {
                    amp = amp * f;
                }

                // Recalculate the collor values.    
                var r = color1.r * amp + color2.r * (1.0 - amp);
                var g = color1.g * amp + color2.g * (1.0 - amp);
                var b = color1.b * amp + color2.b * (1.0 - amp);

                // Set the color values at pixel level.
                var position = rx * 4 + (ry * size * 4);
                px.data[position] = r;
                px.data[position + 1] = g;
                px.data[position + 2] = b;
                px.data[position + 3] = 255;
            }
        }

        // Put the calculated data back on the canvas and create an image of it.
        ctx.putImageData(px, 0, 0);
        var img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");

        // Create an easeljs bitmap of the image.
        var image = new createjs.Bitmap();
        image.image = img;
        image.scaleX = 1;
        image.scaleY = 1;
        image.snapToPixel = true;
        image.x = x - (size / 2);
        image.y = y - (size / 2);

        // Add the image item to the parten frame.
        this._container.addChild(image);
    };

    p.height = function() {
        return this._heigth;
    };

    p.image = function(fname, center, x, y, scale) {
        // Set the class private properties. 
        var image = new createjs.Bitmap();
        image.image = fname.data;
        image.scaleX = scale;
        image.scaleY = scale;
        image.snapToPixel = true;

        if([1,"1",true, "yes"].indexOf(center) !== -1){
            image.x = x - ((image.image.width * scale) / 2);
            image.y = y - ((image.image.height * scale) / 2);
        }else{
            image.x = x;
            image.y = y;
        }

        // Add the text item to the parten frame.
        this._container.addChild(image);
    };

    p.init_display = function(experiment) {
        // Set the dimension properties.
        this._height = experiment.vars.height;
        this._width = experiment.vars.width;

        // Resize the container div to the same size as the canvas
        // This will make sure items other than the canvas (forms, videos)
        // will also be displayed with the same dimensions.
        osweb.parameters._resizeOswebDiv(this._width, this._height);

        // Initialize the display dimensions.
        osweb.runner._canvas.height = experiment.vars.height;
        osweb.runner._canvas.width = experiment.vars.width;

        // Initialize the display color.
        osweb.runner._canvas.style.background = experiment.vars.background;

        // Set the cursor visibility to none (default).
        osweb.runner._canvas.style.cursor = 'none';

        // Set focus to the experiment canvas.
        osweb.runner._canvas.focus();
    };

    p.line = p._configurable(function(sx, sy, ex, ey) {
        var shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(this.styles.penwidth);
        shape.graphics.beginStroke(this.styles.color);
        shape.graphics.moveTo(sx, sy);
        shape.graphics.lineTo(ex, ey);

        // Add the line item to container.
        this._container.addChild(shape);
    });

    p.nl2br = function(str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    p.noise = function(x, y, env, size, stdev, color1, color2, bgmode) {
        // Returns a surface containing a noise patch. 
        env = this._match_env(env);

        /* # Generating a noise patch takes quite some time, so keep
    	# a cache of previously generated noise patches to speed up
    	# the process.
    	global canvas_cache
    	key = u"noise_%s_%s_%s_%s_%s_%s" % (env, size, stdev, col1, col2, bgmode)
    	if key in canvas_cache:
    		return canvas_cache[key] */

        // Create a temporary canvas to make an image data array.        
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var px = ctx.getImageData(0, 0, size, size);

        // Create a surface
        color1 = this._color(color1);
        color2 = this._color(color2);

        // rx and ry reflect the real coordinates in the target image
        for (var rx = 0; rx < size; rx++) {
            for (var ry = 0; ry < size; ry++) {
                // Distance from the center
                var ux = rx - 0.5 * size;
                var uy = ry - 0.5 * size;
                var r = Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2));
                // Get the amplitude without the envelope (0 .. 1)
                var amp = Math.random();
                // The envelope adjustment
                if (env === 'g') {
                    f = Math.exp(Math.pow(-0.5 * (ux / stdev), 2) - Math.pow(0.5 * (uy / stdev), 2));
                } else if (env === 'l') {
                    f = Math.max(0, (0.5 * size - r) / (0.5 * size));
                } else if (env === 'c') {
                    if (r > 0.5 * size) {
                        f = 0.0;
                    } else {
                        f = 1.0;
                    }
                } else {
                    f = 1.0;
                }

                // Apply the envelope
                if (bgmode === 'avg') {
                    amp = amp * f + 0.5 * (1.0 - f);
                } else {
                    amp = amp * f;
                }

                // Recalculate the collor values.    
                var r = color1.r * amp + color2.r * (1.0 - amp);
                var g = color1.g * amp + color2.g * (1.0 - amp);
                var b = color1.b * amp + color2.b * (1.0 - amp);

                // Set the color values at pixel level.
                var position = rx * 4 + (ry * size * 4);
                px.data[position] = r;
                px.data[position + 1] = g;
                px.data[position + 2] = b;
                px.data[position + 3] = 255;
            }
        }

        // Put the calculated data back on the canvas and create an image of it.
        ctx.putImageData(px, 0, 0);
        var img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");

        // Create an easeljs bitmap of the image.
        var image = new createjs.Bitmap();
        image.image = img;
        image.scaleX = 1;
        image.scaleY = 1;
        image.snapToPixel = true;
        image.x = x - (size / 2);
        image.y = y - (size / 2);

        // Add the image item to the parten frame.
        this._container.addChild(image);
    };

    p.polygon = p._configurable(function(verticles) {
        var shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(this.styles.penwidth);
        shape.graphics.beginStroke(this.styles.color);
        if (this.styles.fill == 1) {
            shape.graphics.beginFill(this.styles.color);
        }

        var x = verticles[0][0];
        var y = verticles[0][1];
        shape.graphics.moveTo(verticles[0][0], verticles[0][1]);
        verticles.slice(1);
        verticles.slice(1).forEach(function(point) {
            shape.graphics.lineTo(point[0], point[1]);
        });
        shape.graphics.lineTo(x, y);

        // Add the plygon item to container.
        this._container.addChild(shape);
    });

    p.prepare = function() {};

    p.rect = p._configurable(function(x, y, w, h) {
        var shape = new createjs.Shape();
        shape.graphics.setStrokeStyle(this.styles.penwidth);
        shape.graphics.beginStroke(this.styles.color);
        if (this.styles.fill == 1) {
            shape.graphics.beginFill(this.styles.color);
        }
        shape.graphics.rect(x, y, w, h);

        // Add the line item to container..
        this._container.addChild(shape);
    });

    /**
     * *DEPRECATED*
     * Sets the font parameters. The new way is to set these directly, for
     * instance:
     *
     *     canvas.styles.font_family = "Helvetica";
     *     canvas.styles.size = 16;
     * 
     * @param {string} family    The font family
     * @param {int} size      The font size
     * @param {boolean} italic    true for italic fonts
     * @param {boolean} bold      true for bold fonts
     * @param {boolean} underline true for underlined fonts
     */
    p.set_font = function(family, size, italic, bold, underline) {
        // Define the the font styles.
        this.styles.font_family = family || this.styles.font_family;
        this.styles.font_size = size || this.styles.font_size;
        this.styles.font_italic = italic || this.styles.font_italic;
        this.styles.font_bold = bold || this.styles.font_bold;
        this.styles.font_underline = underline || this.styles.font_underline;
    };

    p.show = function() {
        // Add the container to the stage object and update the stage.
        osweb.runner._stage.addChild(this._container);
        osweb.runner._stage.update();

        // Return the current time.
        if (this.experiment != null) {
            return this.experiment.clock.time();
        } else {
            return null;
        }
    };

    p.size = function() {
        // Create object tuple.
        var size = {
            width: this._width,
            height: this._height
        };
        return size;
    };

    p.text = p._configurable(function(text, center, x, y, html) {
        // Only jump through the HTML rendering hoops if the html == 'yes' and
        // text actually contains HTML markup.
        if(html === "yes" && this._containsHTML(text) ){ 
            // Create a div container to hold the html contents.
            var container = this._create_div_for_text(text, center);
            // Calculate the text size of the text to render.
            container_size = this.text_size(container);
            container_width = container_size[0];
            container_height = container_size[1];

            // Serialize the div container to a HTML string.
            if (typeof container.documentElement !== 'undefined') {
                var html = (new XMLSerializer).serializeToString(container.documentElement);
            }else{
                // Account for IE quirk (even though the rest won't work at all in IE)
                var html = (new XMLSerializer).serializeToString(container);
            }

            // Create a SVG string to embed the HTML into.
            var svg = '<svg xmlns="http://www.w3.org/2000/svg">'+
            '<style scoped="">' +
            'html::-webkit-scrollbar { display: none; }' +
            '</style>' + 
            '<foreignObject x="0" y="0" width="'+container_width+'px" height="'+
            container_height+'px" style="float: left;">' + html + 
            '</foreignObject></svg>';
            // Convert the SVG string to a data stream
            var data = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            // Create an HTML Image object and set its source to the svg data stream.
            var img = new Image();
            img.src = data;
            // Create a createJS bitmap.
            var text_element = new createjs.Bitmap(img);
            this._container.addChild(text_element);
            // Calculate the coordinates to position the element at.
            if (center === "1") {
                text_element.x = x - container_width/2;
                text_element.y = y - container_height/2;
            } else {
                text_element.x = x; 
                text_element.y = y;
            }
        }else{
            var font_string = this._create_font_string();

            var text_element = new createjs.Text(text, font_string, 
                this.styles.color);

            text_element.lineWidth = this.width(); // max width before wrapping.
            text_element.lineHeight = 32;
            text_element.textAlign = "center";

            width = text_element.getMeasuredWidth();
            height = text_element.getMeasuredHeight()
        
            if (center === "1") {
                text_element.x = x;
                text_element.y = y - height/2;
            } else {
                // x coordinate designates the left side of the element
                text_element.x = x + width/2;
                text_element.y = y;
            }
        }

        // Add the text item to the parten frame.
        this._container.addChild(text_element);
    });

    /**
     * Return the text size in pixels. [! DOCSTRING NEEDS REVIEW !]
     * @param  {string or HTMLDivElement} text    The text to calculate the size of.
     * When the text is HTML a div element is created of which the size is measured.
     * It is also possible to pass a premade dive of which the size is measured.
     * @param  {int} max_width  The maximum width of the text
     * @param  {object}         Style_args Object containing the style args for the text
     * @return {array}          The size of the text as [width, height]
     */
    p.text_size = p._configurable(function(text, max_width) {
        // Check if text is a string containing HTML, or is already supplied as a
        // HTMLDivElement (by canvas.text for instance)
        if((typeof(text) == "string" && this._containsHTML(text)) || 
            text instanceof HTMLDivElement){
            // Now comes the hacky/tricky part. To measure the size of 
            // the text, we need to actually enter the div into the DOM, measure 
            // its dimensions, and remove it from the DOM again. It's best of 
            // course if the div is not visible during this, so we
            // temporarily set 'visibility' to 'hidden' here.
            
            if(typeof(text) == "string"){
                // Convert the html string to a div object
                container = this._create_div_for_text(text);
            }else{
                // text is already a Div object, so nothing else is needed here.
                container = text;
            }
            
            container.style.visibility = "hidden";
            container.style.position = "absolute";

            document.body.appendChild(container);
            container_width = container.clientWidth + 1;
            container_height = container.clientHeight + 1;
            container.parentNode.removeChild(container);

            container.style.visibility = "visible";
            container.style.position = "inherit";

            return [
                container_width,
                container_height
            ];
        }else{
            var font_string = this._create_font_string();
            var text_element = new createjs.Text(text, font_string, 
                    this.styles.color);
            // max width before wrapping.
            text_element.lineWidth = max_width || this.width(); 
            return [
                Math.round(text_element.getMeasuredWidth()),
                Math.round(text_element.getMeasuredHeight())
            ];
        }
    });

    /**
     * Returns the canvas width
     * @return {int} The width of the canvas in pixels.
     */
    p.width = function() {
        return this._width;
    };

    // Bind the canvas class to the osweb namespace.
    osweb.canvas = canvas;
}());
(function() {
    // Definition of the class clock.
    function clock(experiment) {
        // Definition of private properties. 
        this._startTime = this._now(); // Start time anchor of the experiment.

        // Set the class public properties. 
        this.experiment = experiment; // Anchor to the experiment object.
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
        } else if (window.performance.webkitNow) {
            return Math.round(window.performance.webkitNow());
        } else {
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
        if (this.experiment !== null) {
            // Set the event processor.
            osweb.events._run(this, duration, osweb.constants.RESPONSE_DURATION, null);
        }
    };

    p.time = function() {
        // Gives the current timestamp in milliseconds. 
        if (this._startTime !== -1) {
            return (this._now() - this._startTime);
        } else {
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
        this.experiment = experiment; // Anchor to the experiment object. 
        this.keylist = (typeof keylist === 'undefined') ? [] : keylist; // List of acceptable response keys. 
        this.timeout = (typeof timeout === 'undefined') ? null : timeout; // Duration in millisecond for time-out.
    };

    // Extend the class from its base class.
    var p = keyboard.prototype;

    // Definition of public properties. 
    p.experiment = null;
    p.keylist = [];
    p.timeout = null;

    // Definition of the synoniem map for all keys.                                  
    p.SYNONIEM_MAP = [
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

    // Definition of private methods.

    p._get_default_from_synoniem = function(responses) {
        var defaults = [];
        for (var i = 0; i < responses.length; i++) {
            var synoniem = this.synonyms(responses[i]);
            defaults.push(synoniem[0]);
        }
        return defaults;
    };

    // Definition of public methods.

    p.default_config = function() {
        // Return the default configuration.
        return {
            'timeout': null,
            'keylist': []
        };
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
        } else {
            // Hack to hide the virtual keyboard. ## Must be tested!
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
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

    // Bind the keyboard class to the osweb namespace.
    osweb.keyboard = keyboard;
}());
(function() {
    // Definition of the class log.
    function log(experiment, path) {
        // Set the class private properties. 
        this._all_vars = null; // If true all variables are written to the log.  
        this._header_written = false; // If true the header has been written to the log.
        this._log = []; // Array containing the log entries.
        this._path = ''; // Path to wich the log is written.

        // Set the class public properties. 
        this.experiment = experiment; // Anchor to the experiment object.
        this.experiment.vars.logfile = path; // Store the path location into the vars list.   
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
        } else {
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
        this.volume = (typeof volume === 'undefined') ? 1 : volume;

        this._instance = null;

        // Create the sound instance
        if (src !== null) {
            // Set the sound object.  
            this._instance = src.data;
            // Set the event anchor for
            this._stopEvent = this._instance.on("ended", osweb.events._audioEnded.bind(this));
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

        if(this._instance != null){
            // Set the sound properties.
            this._instance.volume = this.volume;

            // Play the actual sound.
            this._instance.play();
        }
    };

    p.wait = function() {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_SOUND, []);
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
            this._video.on("play", osweb.events._videoPlay.bind(this));
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
            var xScale = (this.experiment._canvas._width / this._video.videoWidth);
            var yScale = (this.experiment._canvas._height / this._video.videoHeight);
            this._ctx.scale(xScale, yScale);
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
        osweb.events._run(this, -1, osweb.constants.RESPONSE_VIDEO, []);
    };

    // Bind the video class to the osweb namespace.
    osweb.video_backend = video;
}());
(function() {
    // Definition of the class debug.
    function debug() {
        throw 'The class debug cannot be instantiated!';
    }

    // Definition of public properties.
    debug.enabled = false; // Enable the debugger  
    debug.error = false; // true if an error occured.
    debug.messageLog = new Array(); // Arraty with alle log messages.

    // Definition of class private methods.               

    debug._initialize = function() {
        // Enabled/disable the debugger.
        this.debug = osweb.runner.debug;
        // Clear the log.
        this.messageLog = [];
    };

    debug._finalize = function() {
        // If enabled push the messages to the javascript console.
        if (this.enabled === true) {
            console.log(this.messageLog);
        }

        // Clear the log.
        this.messageLog = [];
    };

    // Definition of the public methods.               

    debug.addError = function(error_text) {
        // Set the error flag.
        this.error = true;

        // Show the fatal error warning.
        console.log(error_text);
        console.log(osweb.constants.ERROR_001);

        // Set status of the runner.
        osweb.runner.status = osweb.constants.RUNNER_ERRROR;

        // Throw the exception.
        throw new Error(error_text);
    };

    debug.addMessage = function(message_text) {
        // Push the error message to the log.
        this.messageLog.push(message_text);

        if (debug.enabled === true) {
            console.log(message_text);
        }
    };

    debug.msg = function(message_text) {
        // Push the error message to the log.
        this.addMesage(message_text);
    };

    // Bind the debug class to the osweb namespace.
    osweb.debug = debug;
}());
/*
 * Definition of the class file_pool_store.
 */

(function() {
    function file_pool_store() {
        throw "The class file_pool_store cannot be instantiated!";
    };

    // Definition of private class properties.
    file_pool_store._data = [];
    file_pool_store._items = [];

    /*
     * Definition of private class methods.   
     */

    file_pool_store._add = function(item) {
        // Add the item to the pool.
        this._items.push(item);

        // Link the item as property
        this[item.name] = item;
    }; 

    file_pool_store.add_from_local_source = function(pItem) {
        var ext = pItem.filename.substr(pItem.filename.lastIndexOf('.') + 1);

        if ((ext == 'jpg') || (ext == 'png')) {
            // Create a new file pool mage item.
            var img = new Image();
            img.src = pItem.toDataURL();
            var item = {
                data: img,
                folder: pItem.filename,
                name: pItem.filename.replace(/^.*[\\\/]/, ''),
                size: pItem.length,
                type: 'image'
            };
        } else if ((ext == 'wav') || (ext == 'ogg')) {
            var ado = new Audio();
            ado.src = pItem.toDataURL();
            var item = {
                data: ado,
                folder: pItem.filename,
                name: pItem.filename.replace(/^.*[\\\/]/, ''),
                size: pItem.length,
                type: 'sound'
            };
        } else if (ext == 'ogv') {
            var ado = document.createElement("VIDEO");
            ado.src = pItem.toDataURL();
            var item = {
                data: ado,
                folder: pItem.filename,
                name: pItem.filename.replace(/^.*[\\\/]/, ''),
                size: pItem.length,
                type: 'video'
            };
        }

        // Add the item to the pool.
        this._items.push(item);

        // Link the item as property
        this[item.name] = item;
    };

    file_pool_store.add_from_server_source = function(pPath, pFiles) {
        console.log('--');
        console.log(pFiles);

        // Check if there are stimuli files.
        if (pFiles.length > 0) {
            // Set the preloader.
            this._queue = new createjs.LoadQueue(false);
            createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]); // need this so it doesn't default to Web Audio
            this._queue.installPlugin(createjs.Sound);

            this._queue.on("fileload", this._file_complete, this);
            this._queue.on("complete", this._load_complete, this);

            // Add the stimuli information to the loader.
            for (var i = 0; i < pFiles.length; i++) {
                var re = /(?:\.([^.]+))?$/;
                var extention = re.exec(pFiles[i]);
                console.log(extention);

                if (extention[0] == '.ogg') {
                    console.log('sound');
                    this._queue.loadFile({
                        id: pFiles[i],
                        src: pPath + pFiles[i],
                        type: createjs.AbstractLoader.SOUND
                    });
                } else {
                    this._queue.loadFile({
                        id: pFiles[i],
                        src: pPath + pFiles[i],
                        type: createjs.AbstractLoader.IMAGE
                    });
                }
            }

            // Load the stimuli files.
            this._queue.load();
        } else {
            // Build the experiment objects using the given script.
            osweb.runner._build();
        }
    };

    file_pool_store._file_complete = function(pEvent) {
        // Update the loader text.
        osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_007);

        // Push the stimulus item to the stimuli object.
        var item = {
            data: pEvent.result,
            folder: pEvent.item.id,
            name: pEvent.item.id.replace(/^.*[\\\/]/, ''),
            size: pEvent.item.id,
            type: 'image'
        };

        // Add the item to the pool.
        this._items.push(item);

        // Link the item as property
        this[item.name] = item;
    };

    file_pool_store._load_complete = function() {
        // Update the loader text.
        osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_006);

        console.log(this._items);

        // Building is done, go to next phase.
        osweb.runner._build();
    };

    /*
     * Definition of public class methods.   
     */

    file_pool_store.add = function(pPath, pNew_Name) {
        // Copies a file to the file pool. 
    };

    file_pool_store.fallback_folder = function() {
        // The full path to the fallback pool folder.
    };

    file_pool_store.files = function() {
        // Returns all files in the file pool.
    };

    file_pool_store.folder = function() {
        // The full path to the (main) pool folder.
    };

    file_pool_store.folders = function() {
        // Gives a list of all folders that are searched when retrieving the full path to a file. 
    };

    file_pool_store.in_folder = function(pPath) {
        // Checks whether path is in the pool folder. 
    };

    file_pool_store.rename = function(pOld_path, pNew_path) {
        // Renames a file in the pool folder.
    };

    file_pool_store.size = function() {
        // The combined size in bytes of all files in the file pool.
    };

    // Bind the stack file_pole_store to the osweb namespace.
    osweb.pool = file_pool_store;
}());
/*
 * Definition of the class heartbeat.
 */

(function() {
    function heartbeat(pExperiment, pInterval) {
        // Set the class public properties. 
        this.experiment = pExperiment;
        this.interval = (typeof pInterval === 'undefined') ? 1 : pInterval;
    };

    // Extend the class from its base class.
    var p = heartbeat.prototype;

    // Define the class public properties. 
    p.experiment = null;
    p.interval = -1;

    /*
     * Definition of class private methods.   
     */

    p.beat = function() {};

    p.run = function() {};

    p.start = function() {};

    // Bind the heartbeat class to the osweb namespace.
    osweb.heartbeat = heartbeat;
}());
/*
 * Definition of the class item_stack.
 */

(function() {
    function item_stack() {
        throw "The class item_stack cannot be instantiated!";
    };

    // Definition of private class properties.
    item_stack._items = [];

    /*
     * Definition of public class methods.   
     */

    item_stack.clear = function() {
        // Clears the stack.
        this._items = [];
    };

    item_stack.push = function(pItem, pPhase) {
        // Create the stack item.
        var StackItem = {
            'item': pItem,
            'phase': pPhase
        };

        // Push the item onto the stack.
        this._items.push(StackItem);
    };

    item_stack.pop = function() {
        // Pops the last item from the stack.
        return this._items.pop();
    };

    // Bind the item_stack class to the osweb namespace.
    osweb.item_stack = item_stack;
}());
/*
 * Definition of the class item_store.
 */

(function() {
    function item_store() {
        throw "The class item_store cannot be instantiated!";
    }

    // Set the class private properties. 
    item_store._experiment = null;
    item_store._items = {};

    /*
     * Definition of public methods - running item.         
     */

    item_store.execute = function(pName, pParent) {
        // Executes the run and prepare phases of an item, and updates the item stack.
        this.prepare(pName);
        this.run(pName, pParent);
    };

    item_store.items = function() {
        // Create a list o keys.
        var items = [];
        for (var key in this._items) {
            items.push([key, this._items[key]]);
        }

        // Returns a list of item names.
        return items;
    };

    item_store.keys = function() {
        // Create a list o keys.
        var keys = [];
        for (var key in this._items) {
            keys.push(key);
        }

        // Returns a list of item names.
        return keys;
    };

    item_store.new = function(pType, pName, pScript) {
        // Check if the element is part of the osweb name space
        if (osweb.isClass(pType) == true) {
            // Add the new item as property of items.
            this._items[pName] = osweb.newItemClass(pType, this._experiment, pName, pScript);
        } else {
            // Unkwone class definition, show error message.
            osweb.debug.addError(osweb.constants.ERROR_009 + pType);
        }
    };

    item_store.prepare = function(pName, pParent) {
        // Executes the prepare phase of an item, and updates the item stack.
        osweb.item_stack.push(pName, 'prepare');

        this._items[pName]._parent = pParent;
        this._items[pName].prepare();
    };

    item_store.run = function(pName, pParent) {
        // Set the current and its parent item.
        osweb.events._current_item = this._items[pName];
        osweb.events._current_item._parent = pParent;

        // Executes the run phase of an item, and updates the item stack.
        osweb.item_stack.push(pName, 'run');
        this._items[pName].run();
    };

    item_store.valid_name = function(pItem_type, pSuggestion) {
        // Check the optional parameters.
        pSuggestion = (typeof pSuggestion === 'undefined') ? null : pSuggestion;

        if (pSuggestion == null) {
            var name = 'new_' + pItem_type;
        } else {
            var name = this._experiment.syntax.sanitize(pSuggestion, true, false);
        }

        // Create a unique name.
        var i = 1;
        var _name = name;
        while (this._items.hasOwnProperty(_name) == true) {
            _name = name + '_' + String(i);
            i++;
        }

        // Return function result
        return _name;
    };

    item_store.values = function() {
        // Create a list o keys.
        var values = [];
        for (var key in this._items) {
            values.push(this._items[key]);
        }

        // Returns a list of item names.
        return values;
    };

    // Bind the item_store class to the osweb namespace.
    osweb.item_store = item_store;
}());
/*
 * Definition of the class python_workspace.
 */

(function() {
    function python_workspace() {
        throw "The class python_workspace cannot be instantiated!";
    };

    /*
     * Definition of public class methods.   
     */

    python_workspace._eval = function(pBytecode) {
        // Check wich type of expression must be evaled.
        if (typeof pBytecode === 'boolean') {
            return pBytecode;
        } else if (typeof pBytecode === 'string') {
            // Open sesame script, first check for parameter values. 
            pBytecode = osweb.syntax.eval_text(pBytecode);

            // Evaluate the expression.
            eval_string = osweb.syntax.remove_quotes(pBytecode)
            if (eval_string == "always") {
                return true;
            } else if (eval_string == "never") {
                return false;
            } else {
                return eval(eval_string);
            }
        } else {
            console.log('>python script - not supported yet');
            return eval(pBytecode);
        }
    };

    python_workspace.init_globals = function() {};

    // Bind the python_workspace class to the osweb namespace.
    osweb.python_workspace = python_workspace;
}());
(function() {
    // Definition of the class python_workspace.
    function python_workspace_api() {
        throw 'The class python_workspace_api cannot be instantiated!';
    };

    // Definition of private methods.   

    python_workspace_api._initialize = function() {
        // Create the global function calls for use in the inlide script item.
        window['canvas'] = this.canvas;
        window['copy_sketchpad'] = this.copy_sketchpad;
        window['keyboard'] = this.keyboard;
        window['mouse'] = this.mouse;
        window['pause'] = this.pause;
        window['reset_feedback'] = this.reset_feedback;
        window['sampler'] = this.sampler;
        window['set_response'] = this.set_response;
        window['set_subject_nr'] = this.set_subject_nr;
        window['sometimes'] = this.sometimes;
        window['synth'] = this.synth;
        window['xy_circle'] = this.xy_circle;
        window['xy_distance'] = this.xy_distance;
        window['xy_from_polar'] = this.xy_from_polar;
        window['xy_grid'] = this.xy_grid;
        window['xy_random'] = this.xy_random;
        window['xy_to_polar'] = this.xy_to_polar;
    };

    // Definition of public methods - global functions.   

    python_workspace_api.canvas = function(auto_prepare, style_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'canvas().');
    };

    python_workspace_api.copy_sketchpad = function(name) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'copy_sketchpad().');
    };

    python_workspace_api.keyboard = function(resp_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'keyboard().');
    };

    python_workspace_api.mouse = function(resp_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'mouse().');
    };

    python_workspace_api.pause = function() {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.reset_feedback = function() {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.sampler = function(src, playback_args) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.set_response = function(response, response_time, correct) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.set_subject_nr = function(nr) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.sometimes = function(p) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.synth = function(osc, freq, length, attack, decay) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'pause().');
    };

    python_workspace_api.xy_circle = function(n, rho, phi0, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'cy_circle().');
    };

    python_workspace_api.xy_distance = function(x1, y1, x2, y2) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_distance().');
    };

    python_workspace_api.xy_from_polar = function(rho, phi, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_from_polar().');
    };

    python_workspace_api.xy_grid = function(n, spacing, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_grid().');
    };

    python_workspace_api.xy_random = function(n, width, height, min_dist, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_random().');
    };

    python_workspace_api.xy_to_polar = function(x, y, pole) {
        osweb.debug.addMessage(osweb.constants.MESSAGE_007 + 'xy_to_polar().');
    };

    // Bind the python_workspace_api class to the osweb namespace.
    osweb.python_workspace_api = python_workspace_api;
}());
(function() {
    // Definition of the class response_info.
    function response_info(response_store, response, correct, response_time, item, feedback) {};

    // Extend the class from its base class.
    var p = response_info.prototype;

    // Definition of public methods - properties.   

    p.match = function(kwdict) {};

    p.matchnot = function(kwdict) {};

    // Bind the response_info class to the osweb namespace.
    osweb.response_info = response_info;
}());
(function() {
    // Definition of the class response_store.
    function response_store(experiment) {
        // Definition of private properties.
        this._experiment = experiment;
        this._feedback_from = 0;
        this._responses = [];
    };

    // Extend the class from its base class.
    var p = response_store.prototype;

    // Definition of public methods - properties.   

    p.acc = function() {};

    p.avg_rt = function() {};

    p.correct = function() {};

    p.feedback = function() {};

    p.item = function() {};

    p.response = function() {};

    p.response_time = function() {};

    p.var = function() {};

    // Definition of public methods - edit.   

    p.add = function(response, correct, response_time, item, feedback) {};

    p.clear = function() {};

    p.reset_feedback = function() {};

    // Bind the response_store class to the osweb namespace.
    osweb.response_store = response_store;
}());
 /*
  * Definition of the class syntax.
  */

 (function() {
     function syntax() {
         throw "The class syntax cannot be instantiated!";
     };

     /*
      * Definition of private class methods.   
      */

     syntax._convertPython = function(pScript) {
         return pScript;
     };

     syntax.isNumber = function(n) {
         return Number(n) == n; // aangepast van == naar === en weer terug naar '==' anders werkt duration niet.
     };

     syntax.isFloat = function(n) {
         return Number(n) === n && n % 1 !== 0;
     };

     syntax.remove_quotes = function(pString) {
         if (pString == '""') {
             return '';
         } else if ((pString[0] == '"') && (pString[pString.length - 1] == '"')) {
             return pString.slice(1, pString.length - 1);
         } else {
             return pString;
         }
     };

     /*
      * Definition of public class methods.   
      */

     syntax.compile_cond = function(pCnd, pBytecode) {
         // Check for conditional paramters.
         pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;

         if (pCnd == 'always') {
             return true;
         } else if (pCnd == 'never') {
             return false;
         } else {
             if (pCnd.substring(0, 1) == '=') {
                 // Python script, compile it to an ast tree.
                 console.log('python script is not supported yet');
             } else {
                 // opensesame script, convert it to javascript.
                 pCnd = pCnd.replace(/[^(!=)][=]/g, '==');
             }
         }

         return pCnd;
     };

     syntax.eval_text = function(pTxt, pVars, pRound_float, pVar) {
         // Evaluates variables and inline Python in a text string.
         var result = pTxt;
         var processing = result.search(/[^[\]]+(?=])/g);

         while (processing != -1) {
             // Replace the found value with the variable.
             var variable = result.slice(processing, result.indexOf(']'));

             if (typeof pVars === 'undefined') {
                 var value = osweb.runner.experiment.vars[variable];
             } else {
                 var value = pVars[variable];
             }

             result = result.replace('[' + variable + ']', value);
             processing = result.search(/[^[\]]+(?=])/g);
         }

         return result;
     };

     syntax.parse_cmd = function(pString) {
         // split the astring.
         var tokens = this.split(pString);
         tokens.shift();
         tokens.shift();
         return tokens;
     };

     syntax.sanitize = function(pString, pStrict, pAllowVars) {
         // Removes invalid characters (notably quotes) from the string.
         return pString;
     };

     syntax.split = function(pLine) {
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

(function() {
    function var_store(item, parent) {
        // Set the class properties. 
        this._item = item;
        this._parent = parent;
    };

    // Extend the class from its base class.
    var p = var_store.prototype;

    // Set the class default properties. 
    p._item = null;
    p._parent = null;

    // Definition of public class methods.   

    p.get = function(pVar, pDefault, pEval, pValid) {
        // Set the optional arguments
        pDefault = (typeof pDefault === 'undefined') ? null : pDefault;
        pEval = (typeof pEval === 'undefined') ? true : pEval;
        pValid = (typeof pValid === 'undefined') ? null : pValid;

        var value = null;

        // Gets an experimental variable.
        if (pVar in this) {
            if (typeof this[pVar] == 'string') {
                value = osweb.syntax.eval_text(this[pVar]);
            } else {
                value = this[pVar];
            }
        }
        // If value is not found locally, look in experiment object.
        if(value == null && this._parent && pVar in this._parent){
            if (typeof this._parent[pVar] == 'string') {
                value = osweb.syntax.eval_text(this._parent[pVar]);
            } else {
                value = this._parent[pVar];
            } 
        }

        // Return function result.
        return value;
    };

    p.has = function(variable) {
    };

    p.inspect = function() {
        var keys = [];
        for (var key in this) {
            keys.push(key);
        }

        // Slide default properties. 
        keys = keys.slice(2, keys.length - 3);

        return keys;
    };

    p.items = function() {
    };

    p.set = function(variable, value) {
        // Sets and experimental variable.
        this[variable] = value;
    };

    p.unset = function(variable){
    };

    p.vars = function() {
    };

    // Bind the vars class to the osweb namespace.
    osweb.var_store = var_store;
}());
(function() {
    // Definition of the class Style.
    // 
    // Style is a simple class that holds information about the style with which
    // a stimulus is to be drawn. One simply uses style by storing the desired
    // style information in it. For instance, to store a color and a penwidth
    // one should simply do
    // 
    //     style = new Styles()
    //     style.color = "#F00"
    //     style.penwidth = 3
    //     
    function Styles() {
        this.color = "white";
        this.background_color = "black";
        this.fill = 1;
        this.penwidth = 1;
        this.bidi = false
        this.html = true;
        this.font_family = "Sans serif";
        this.font_size = 12;
        this.font_italic = false;
        this.font_bold = false;
        this.font_underline = false;
    };

    // Extend the class from its base class.
    var p = Styles.prototype;

    /**
     * The default font mappings for OpenSesame
     * @type {Object}
     */
    p.default_fonts = {
        "sans" : "Droid Sans",
        "serif" : "Droid Serif",
        "mono" : "Droid Sans Mono",
        "chinese-japanese-korean" : "WenQuanYi Micro Hei",
        "arabic" : "Droid Arabic Naskh",
        "hebrew" : "Droid Sans Hebrew",
        "hindi" : "Lohit Hindi"
    }

    /**
     * Checks if the passed value is an integer
     * @param  value The value to check
     * @return {Boolean}  True if passed value is an integer
     */
    p.isInt = function(value){
        var x;
        return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
    };

    /**
     * Checks if value is possibly specified as 'yes'/'no' or 1/0 instead of
     * true or false (as is done in OS script). Convert 'yes' and 'no' values
     * to booleans
     * @param  value The value to check
     * @return {boolean} The original boolean, or true if value was 'yes' 
     */
    p._check_val = function(value){
        return [true, 'yes', 1, '1'].indexOf(value) != -1;
    }

    Object.defineProperty(p, "color", {
        get: function(){ return this._color },
        set: function(val){
            // val can be 0-255 to indicate a greyscale value. Check for that here
            // and convert accordingly to rgb(x,x,x) (something that EaselJs does
            // understand. )
            if(this.isInt(val)) {
                val = 'rgb('+val+','+val+','+val+')';
            }
            this._color = val;
        }
    });

    Object.defineProperty(p, "background_color", {
        get: function(){ return this._background_color },
        set: function(val){
            // val can be 0-255 to indicate a greyscale value. Check for that here
            // and convert accordingly to rgb(x,x,x) (something that EaselJs does
            // understand. )
            if(this.isInt(val)) {
                val = 'rgb('+val+','+val+','+val+')';
            }
            this._background_color = val;
        }
    });

    Object.defineProperty(p, "penwidth", {
        get: function(){ return this._penwidth },
        set: function(val){
            if(!this.isInt(val)) {
                throw "Invalid value for penwidth. Should be a number";
            }
            this._penwidth = val;
        }
    });

    Object.defineProperty(p, "font_size", {
        get: function(){ return this._font_size },
        set: function(val){
            if(!this.isInt(val)) {
                throw "Invalid value for font_size. Should be an integer";
            }
            this._font_size = val;
        }
    });

    Object.defineProperty(p, "fill", {
        get: function(){ return this._fill },
        set: function(val){ this._fill = this._check_val(val) }
    });

    Object.defineProperty(p, "font_family", {
        get: function(){ return this._font_family },
        set: function(val){
            if(val in this.default_fonts){
                this._font_family = this.default_fonts[val];
            }else{
                this._font_family = val;
            }
        }
    });

    Object.defineProperty(p, "font_italic", {
        get: function(){ return this._font_italic },
        set: function(val){ this._font_italic = this._check_val(val) }
    });

    Object.defineProperty(p, "font_bold", {
        get: function(){ return this._font_bold },
        set: function(val){ this._font_bold = this._check_val(val) }
    });

    Object.defineProperty(p, "font_underline", {
        get: function(){ return this._font_underline },
        set: function(val){ this._font_underline = this._check_val(val) }
    });

    Object.defineProperty(p, "html", {
        get: function(){ return this._html },
        set: function(val){ this._html = this._check_val(val) }
    });

    Object.defineProperty(p, "bidi", {
        get: function(){ return this._bidi },
        set: function(val){ this._bidi = this._check_val(val) }
    });

    // Bind the Style class to the osweb namespace.
    osweb.Styles = Styles;
}());
	/*
	 * Definition of the class item.
	 */

	(function() {
	    function item(pExperiment, pName, pScript) {
	        // Set the class private properties.
	        this._get_lock = null;
	        this._parent = null;
	        this._status = osweb.constants.STATUS_NONE;

	        // Set the class public properties.
	        this.count = 0;
	        this.debug = osweb.debug.enabled;
	        this.experiment = (pExperiment == null) ? this : pExperiment;
	        this.name = pName;
	        
	        // Determine the parent item varstore.
	        var parent_varstore = (this.experiment == pExperiment) ? this.experiment.vars : null
	        this.vars = (this.vars) ? this.vars : new osweb.var_store(this, parent_varstore);

	        // Set the object realted properties.
	        this.clock = this.experiment._clock;
	        this.log = this.experiment._log;
	        this.python_workspace = this.experiment._python_workspace;
	        this.syntax = this.experiment._syntax;

	        // Read the item definition string.	
	        this.from_string(pScript);
	    }

	    // Extend the class from its base class.
	    var p = item.prototype;

	    // Definition of class public properties. 
	    p.clock = null;
	    p.comments = null;
	    p.count = 0;
	    p.debug = false;
	    p.experiment = null;
	    p.log = null;
	    p.name = '';
	    p.syntax = null;
	    p.python_workspace = null;
	    p.vars = null;
	    p.variables = null;

	    /*
	     * Definition of public methods - general function.
	     */

	    p.dummy = function() {
	        // Dummy function, continue execution of an item directly.
	    };

	    p.resolution = function() {
	        /* // Returns the display resolution and checks whether the resolution is valid.
        var w = this.vars.get('width');
	var h = this.vars.get('height');
	if ((typeof w !== 'number') || (typeof h !== 'number'))
	{
            osweb.debug.addError('(' + String(w) + ',' + String(h) + ') is not a valid resolution');
        }
        
        return [w, h]; */
	    };

	    p.set_response = function(pResponse, pResponse_time, pCorrect) {
	        // Processes a response in such a way that feedback variables are updated as well.
	        console.log('warning: method "item.set_response" not implemented yet.');
	    };

	    p.sleep = function(pMs) {
	        // Pauses the object execution. !WARNING This function can not be implemented due the script blocking of javascript.
	        this.clock.sleep(pMs);
	    };

	    p.time = function() {
	        // Returns the current time.
	        return this.clock.time();
	    };

	    /*
	     * Definition of public methods - build cycle.         
	     */

	    p.from_string = function(pString) {
	        // Parses the item from a definition string.
	        osweb.debug.addMessage('');
	        this.variables = {};
	        this.reset();
	        this.comments = [];
	        this.reset();

	        // Split the string into an array of lines.  
	        if (pString != null) {
	            var lines = pString.split('\n');
	            for (var i = 0; i < lines.length; i++) {
	                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {

	                    this.parse_line(lines[i]);
	                }
	            }
	        }
	    };

	    p.parse_comment = function(pLine) {
	        // Parses comments from a single definition line, indicated by # // or '.
	        pLine = pLine.trim();
	        if ((pLine.length > 0) && (pLine.charAt(0) == '#')) {
	            // Add comments to the array removing the first character.
	            this.comments.push(pLine.slice(1));

	            return true;
	        } else if ((pLine.length > 1) && (pLine.charAt(0) == '/')) {
	            // Add comments to the array removing the first two characters.
	            this.comments.push(pLine.slice(2));

	            return true;
	        } else {
	            return false;
	        }
	    };

	    p.parse_keyword = function(pLine, pFrom_ascii, pEval) {};

	    p.parse_line = function(pLine) {
	        // Allows for arbitrary line parsing, for item-specific requirements.
	    };

	    p.parse_variable = function(pLine) {
	        // Reads a single variable from a single definition line.
	        if (this.parse_comment(pLine)) {
	            return true;
	        } else {
	            var tokens = osweb.syntax.split(pLine);
	            if ((tokens != null) && (tokens.length > 0) && (tokens[0] == 'set')) {
	                if (tokens.length != 3) {
	                    osweb.debug.addError('Error parsing variable definition: ' + pLine);
	                } else {
	                    // Rettrieve the value of the variable, remove additional quotes.
	                    var value = osweb.syntax.remove_quotes(tokens[2]);

	                    // Check for number types.
	                    value = osweb.syntax.isNumber(value) ? Number(value) : value;

	                    this.vars.set(tokens[1], value);

	                    return true;
	                }
	            } else {
	                return false;
	            }
	        }
	    };

	    /*
	     * Definition of public methods - runn cycle. 
	     */

	    p.reset = function() {
	        // Resets all item variables to their default value.
	    };

	    p.prepare = function() {
	        // Implements the prepare phase of the item.
	        this.experiment.vars.set('count_' + this.name, this.count);
	        this.count++;

	        // Set the status to initialize.
	        this._status = osweb.constants.STATUS_INITIALIZE;

	        // For debugging.
	        osweb.debug.addMessage('prepare' + this.name);

	        // Implements the complete phase of the item (to support blocking script in the prepare phase).
	        if ((this._parent !== null) && (this.type !== 'feedback')) {
	            // Prepare cycle of parent.
	            this._parent.prepare_complete();
	        }
	    };

	    p.prepare_complete = function() {
	        // Dummy function for completion process.
	    };

	    p.set_item_onset = function(pTime) {
	        // Set a timestamp for the item's executions
	        var time = (pTime != null) ? pTime : this.clock.time();
	        this.experiment.vars.set('time_' + this.name, time);
	    };

	    p.run = function() {
	        // Implements the run phase of the item.
	        osweb.debug.addMessage('run' + this.name);
	    };

	    p.update = function() {
	        // Implements the update phase of the item.
	    };

	    p.update_response = function(pResponse) {
	        // Implements the update_response phase of an item.
	    };

	    p.complete = function() {
	        // Implements the complete phase of the item.
	        if (this._parent !== null) {
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

(function() {
    function generic_response(pExperiment, pName, pScript) {
        // Inherited create.
        this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties.
        this._allowed_responses = null;
        this._duration = 0;
        this._duration_func = null;
        this._keyboard = null;
        this._mouse = null;
        this._responsetype = osweb.constants.RESPONSE_NONE;
        this._timeout = -1;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(generic_response, osweb.item);

    // Definition of public properties.
    p.auto_response = "a";
    p.process_feedback = false;
    p.synonyms = null;

    /*
     * Definition of public methods - build cycle. 
     */

    p.auto_responser = function() {};

    p.auto_responser_mouse = function() {};

    p.prepare_allowed_responses = function() {
        // Prepare the allowed responses..
        if (this.vars.get('allowed_responses') == null) {
            this._allowed_responses = null;
        } else {
            // Create a list of allowed responses that are separated by semicolons. Also trim any whitespace.
            var allowed_responses = String(this.vars.allowed_responses).split(';');

            if (this.vars.duration == 'keypress') {
                //this._allowed_responses = allowed_responses;
                this._allowed_responses = this._keyboard._get_default_from_synoniem(allowed_responses);
            } else if (this.vars.duration == 'mouseclick') {
                // For mouse responses, we don't check if the allowed responses make sense.
                this._allowed_responses = this._mouse._get_default_from_synoniem(allowed_responses);
            }

            // If allowed responses are provided, the list should not be empty.
            if (this._allowed_responses.length == 0) {
                osweb.debug.addError(this.vars.get('allowed_responses') + ' are not valid allowed responses in keyboard_response ' + this.name);
            }
        }
    };

    p.prepare_duration = function() {
        // Prepare the duration.
        if (this.vars.get('duration') != null) {
            if (typeof this.vars.duration == 'number') {
                // Prepare a duration in milliseconds
                this._duration = this.vars.duration;
                if (this._duration == 0) {
                    this._responsetype = osweb.constants.RESPONSE_NONE;
                } else {
                    this._responsetype = osweb.constants.RESPONSE_DURATION;
                }
            } else {
                this._duration = -1;
                if (this.vars.duration == 'keypress') {
                    this.prepare_duration_keypress();
                    this._responsetype = osweb.constants.RESPONSE_KEYBOARD;
                } else if (this.vars.duration == 'mouseclick') {
                    this.prepare_duration_mouseclick();
                    this._responsetype = osweb.constants.RESPONSE_MOUSE;
                } else if (this.vars.duration == 'sound') {
                    this._responsetype = osweb.constants.RESPONSE_SOUND;
                } else if (this.vars.duration == 'video') {
                    this._responsetype = osweb.constants.RESPONSE_VIDEO;
                }
            }
        }
    };

    p.prepare_duration_keypress = function() {
        // Prepare a keyboard duration.
        this._keyboard = new osweb.keyboard(this.experiment);
        if (this.experiment.auto_response == true) {
            this._duration_func = this.auto_responder;
        } else {
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._keyboard.set_config(final_duration, this._allowed_responses);
        }
    };

    p.prepare_duration_mouseclick = function(self) {
        // Prepare a mouseclick duration.
        this._mouse = new osweb.mouse(this.experiment);
        if (this.experiment.auto_response == true) {
            this._duration_func = this.auto_responder_mouse;
        } else {
            var final_duration = (this._timeout != -1) ? this._timeout : this._duration;
            this._mouse.set_config(final_duration, this._allowed_responses, false);
        }
    };

    p.prepare_timeout = function() {
        // Prepare the timeout.
        if (this.vars.get('timeout') != null) {
            if (typeof this.vars.timeout == 'number') {
                // Prepare a duration in milliseconds
                this._timeout = this.vars.timeout;
            } else {
                this._timeout = -1;
            }
        }
    };

    /*
     * Definition of public methods - run cycle. 
     */

    p.process_response_keypress = function(pRetval) {
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = pRetval.rtTime;
        this.experiment.vars.response = this.syntax.sanitize(pRetval.resp);
        this.synonyms = this._keyboard.synonyms(this.experiment.vars.response);
        this.response_bookkeeping();
    };

    p.process_response_mouseclick = function(pRetval) {
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = pRetval.rtTime;
        this.experiment.vars.response = pRetval.resp;
        this.synonyms = this._mouse.synonyms(this.experiment.vars.response);
        this.experiment.vars.cursor_x = pRetval.event.clientX;
        this.experiment.vars.cursor_y = pRetval.event.clientY;
        this.response_bookkeeping();
    };

    p.response_bookkeeping = function() {
        // The respone and response_time variables are always set, for every response item
        this.experiment.vars.set('response_time', this.experiment._end_response_interval - this.experiment._start_response_interval);
        this.experiment.vars.set('response_' + this.name, this.experiment.vars.get('response'));
        this.experiment.vars.set('response_time_' + this.name, this.experiment.vars.get('response_time'));
        this.experiment._start_response_interval = null;

        // But correctness information is only set for dedicated response items, 
        // such as keyboard_response items, because otherwise we might confound the feedback
        if (this.process_feedback == true) {
            if (this.vars.get('correct_response') != null) {
                // If a correct_response has been defined, we use it to determine accuracy etc.
                if (this.synonyms != null) {
                    if (this.synonyms.indexOf(String(this.vars.get('correct_response'))) != -1){
                        this.experiment.vars.correct = 1;
                        this.experiment.vars.total_correct = this.experiment.vars.total_correct + 1;
                    } else {
                        this.experiment.vars.correct = 0;
                    }
                } else {
                    this.experiment.vars.correct = 'undefined';
                    /* if self.experiment.response in (correct_response, safe_decode(correct_response)):
                    	self.experiment.var.correct = 1
			self.experiment.var.total_correct += 1
                    else:
                    	self.experiment.var.correct = 0 */
                }
            } else {
                // If a correct_response hasn't been defined, we simply set correct to undefined.
                this.experiment.vars.correct = 'undefined';
            }

            // Do some response bookkeeping
            this.experiment.vars.total_response_time = this.experiment.vars.total_response_time + this.experiment.vars.response_time;
            this.experiment.vars.total_responses = this.experiment.vars.total_responses + 1;
            this.experiment.vars.accuracy = Math.round(100.0 * this.experiment.vars.total_correct / this.experiment.vars.total_responses);
            this.experiment.vars.acc = this.experiment.vars.accuracy;
            this.experiment.vars.average_response_time = Math.round(this.experiment.vars.total_response_time / this.experiment.vars.total_responses);
            this.experiment.vars.avg_rt = this.experiment.vars.average_response_time;
            this.experiment.vars.set('correct_' + this.name, this.vars.correct);
        }
    };

    p.process_response = function() {
        // Start stimulus response cycle.
        switch (this._responsetype) {
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

    p.set_sri = function(pReset) {
        // Sets the start of the response interval.
        if (pReset == true) {
            this.sri = self.vars.get('time_' + this.name);
            this.experiment._start_response_interval = this.vars.get('time_' + this.name);
        }

        if (this.experiment._start_response_interval == null) {
            this.sri = this.experiment.vars.get('time_' + this.name);
        } else {
            this.sri = this.experiment._start_response_interval;
        }
    };

    p.sleep_for_duration = function() {
        // Sleep for a specified time.
        this.sleep(this._duration);
    };

    /*
     * Definition of public methods - running item. 
     */

    p.prepare = function() {
        // Implements the prepare phase of the item.
        this.prepare_timeout();
        this.prepare_allowed_responses();
        this.prepare_duration();

        // Inherited.	
        this.item_prepare();
    };

    p.update_response = function(pResponse) {
        // Implements the update response phase of the item.
        if ((this._responsetype == osweb.constants.RESPONSE_KEYBOARD) && (pResponse.type == osweb.constants.RESPONSE_KEYBOARD)) {
            this.process_response_keypress(pResponse);
        } else if ((this._responsetype == osweb.constants.RESPONSE_MOUSE) && (pResponse.type == osweb.constants.RESPONSE_MOUSE)) {
            this.process_response_mouseclick(pResponse);
        }
    };

    // Bind the generic_response class to the osweb namespace.
    osweb.generic_response = osweb.promoteClass(generic_response, "item");
}());
/*
 * Definition of the class experiment.
 */

(function() {
	function experiment(pExperiment, pName, pScript, pPool_folder, pExperiment_path, pFullscreen, pAuto_response, pLogfile, pSubject_nr, pWorkspace, pResources, pHeartbeat_interval) {
		// Set the items property for this experiment.
		osweb.item_store._experiment = this;

		// Set the optional arguments
		pLogfile = (typeof pLogfile === 'undefined') ? null : pLogfile;

		// Set the private properties. 
		this._end_response_interval = null;
		this._start_response_interval = null;
		this._syntax = osweb.syntax;
		this._python_workspace = (pWorkspace) ? pWorkspace : osweb.python_workspace;

		// Set the public properties. 
		this.auto_response = (pAuto_response) ? pAuto_response : false;
		this.cleanup_functions = [];
		this.heartbeat_interval = (pHeartbeat_interval) ? pHeartbeat_interval : 1;
		this.items = osweb.item_store;
		this.output_channel = null;
		this.paused = false;
		this.plugin_folder = 'plugins';
		this.pool = osweb.file_pool_store;
		this.resources = (pResources) ? pResources : {};
		this.restart = false;
		this.running = false;
		this.vars = new osweb.var_store(this, null);

		// Set default variables
		this.vars.start = 'experiment';
		this.vars.title = 'My Experiment';
		this.vars.bidi = 'no';
		this.vars.round_decimals = 2;
		this.vars.form_clicks = 'no';
		this.vars.uniform_coordinates = 'no';

		// Sound parameters.
		this.vars.sound_freq = 48000;
		this.vars.sound_sample_size = -16;
		this.vars.sound_channels = 2;
		this.vars.sound_buf_size = 1024;

		// Default backend
		this.vars.canvas_backend = 'xpyriment';

		// Display parameters.
		this.vars.width = 1024;
		this.vars.height = 768;
		this.vars.background = 'black';
		this.vars.foreground = 'white';
		this.vars.fullscreen = (pFullscreen) ? 'yes' : 'no';

		// Font parameters.
		this.vars.font_size = 18;
		this.vars.font_family = 'mono';
		this.vars.font_italic = 'no';
		this.vars.font_bold = 'no';
		this.vars.font_underline = 'no';

		// Logfile parameters
		this.logfile = pLogfile;
		this.debug = osweb.debug.enabled;

		// Create the backend objects.
		this._canvas = new osweb.canvas(this);
		this._clock = new osweb.clock(this);
		this._log = new osweb.log(this, this.logfile);

		// Set the global anchors.
		window['clock'] = this._clock;
		window['log'] = this._log;

		// Inherited.
		this.item_constructor(pExperiment, pName, pScript);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(experiment, osweb.item);

	// Definition of public properties. 
	p.auto_response = false;
	p.cleanup_functions = [];
	p.heartbeat_interval = 1;
	p.items = null;
	p.output_channel = null;
	p.paused = false;
	p.plugin_folder = '';
	p.pool = null;
	p.resources = null;
	p.restart = false;
	p.running = false;

	/*
	 * Definition of public methods - general function.
	 */

	p.item_prefix = function() {
		// A prefix for the plug-in classes, so that [prefix][plugin] class is used instead of the [plugin] class.
		return '';
	};

	p.reset_feedback = function() {
		// Resets the feedback variables (acc, avg_rt, etc.)."""
		this.vars.total_responses = 0;
		this.vars.total_correct = 0;
		this.vars.total_response_time = 0;
		this.vars.avg_rt = 'undefined';
		this.vars.average_response_time = 'undefined';
		this.vars.accuracy = 'undefined';
		this.vars.acc = 'undefined';
	};

	p.set_subject = function(pNr) {
		// Sets the subject number and parity (even/ odd). This function is called automatically when an experiment is started, so you do not generally need to call it yourself.
		this.vars.subject_nr = pNr;
		if ((pNr % 2) == 0) {
			this.vars.subject_parity = 'even';
		} else {
			this.vars.subject_parity = 'odd';
		}
	};

	/*
	 * Definition of public methods - building item.         
	 */

	p.read_definition = function(pString) {
		// Extracts a the definition of a single item from the string.
		var line = pString.shift();
		var def_str = '';
		while ((line != null) && (line.length > 0) && (line.charAt(0) == '\t')) {
			def_str = def_str + line + '\n';
			line = pString.shift();
		}
		return def_str;
	};

	p.from_string = function(pString) {
		// Set debug message.
		osweb.debug.addMessage('building experiment');

		// Split the string into an array of lines.  
		if (pString != null) {
			this._source = pString.split('\n');
			var l = this._source.shift();
			while (l != null) {
				// Set the processing of the next line.
				var get_next = true;

				try {
					// Split the single line into a set of tokens.
					var t = osweb.syntax.split(l);
				} catch (e) {
					// u"Failed to parse script. Maybe it contains illegal characters or unclosed quotes?", \
				}

				if ((t != null) && (t.length > 0)) {
					// Try to parse the line as variable (or comment)
					if (this.parse_variable(l) == false) {
						if (t[0] == 'define') {
							if (t.length == 3) {
								// Get the type, name and definition string of an item.
								var item_type = t[1];
								var item_name = osweb.syntax.sanitize(t[2]);
								var def_str = this.read_definition(this._source);

								osweb.item_store.new(item_type, item_name, def_str);
							} else {
								// raise osexception(u'Failed to parse definition',line=line);
							}
						}
					}
				}

				// Get the next line.
				if (get_next == true) {
					l = this._source.shift();
				}
			}
		};
	};

	/*
	 * Definition of public methods - backends.
	 */

	p.init_clock = function() {
		// Initializes the clock backend.
		this._clock.initialize;
	};

	p.init_display = function() {
		// Initializes the canvas backend.
		this._canvas.init_display(this);

		this._python_workspace['win'] = window;
	};

	p.init_heartbeat = function() {
		// Initializes heartbeat.
		if ((this.heartbeat_interval <= 0) || (this.vars.fullscreen == 'yes') || (this.output_channel == null)) {
			this.heartbeat = null;
		} else {
			this.heartbeat = new osweb.heartbeat(this, 1);
			this.heartbeat.start();
		}
	};

	p.init_log = function() {
		// Open a connection to the log file.
		this._log.open(this.logfile);
	};

	p.init_random = function() {
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

	p.init_sound = function() {
		// Intializes the sound backend.
		/* from openexp import sampler
		sampler.init_sound(self) */
	};

	/*
	 * Definition of public methods - running item.         
	 */

	p.run = function() {
		// Inherited.	
		this.item_run();

		// Runs the experiment.
		switch (this._status) {
			case osweb.constants.STATUS_INITIALIZE:

				// Set the status to finalize.
				this._status = osweb.constants.STATUS_FINALIZE;

				// Save the date and time, and the version of OpenSesame
				this.vars.datetime = new Date().toString();
				this.vars.opensesame_version = osweb.VERSION_NUMBER;
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

				if (osweb.item_store._items[this.vars.start] != null) {
					osweb.item_stack.clear();
					osweb.item_store.prepare(this.vars.start, this);
					//osweb.item_store.execute(this.vars.start, this);
				} else {
					osweb.debug.addError('Could not find item ' + self.vars.start + ' , which is the entry point of the experiment');
				}

				break;
			case osweb.constants.STATUS_FINALIZE:

				// Add closing message to debug system.
				osweb.debug.addMessage('experiment.run(): experiment finished at ' + new Date().toUTCString());

				// Complete the run process.
				this.end();

				break;
		};
	};

	p.end = function() {
		// Disable the run toggle.
		this.running = false;

		// Close the log file.
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

(function() {
    function inline_script(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);

        // Define and set the public properties. 
        this._prepare_run = false;
        this._prepare_tree = null;
        this._run_tree = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(inline_script, osweb.item);

    // Define and set the public properties. 
    p.description = 'Executes Python code';

    /*
     * Definition of private methods - compiling script.
     */

    p._compile = function(pScript) {
        if (pScript != '') {
            var locations = false;
            var parseFn = filbert_loose.parse_dammit;
            var ranges = false;

            try {
                var code = pScript;
                var ast = parseFn(code, {
                    locations: locations,
                    ranges: ranges
                });

                return ast;
            } catch (e) {
                console.log('error');
                console.log(e.toString());

                return null;
            }
        } else {
            return null;
        }
    };

    /*
     * Definition of public methods - building item.         
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this._var_info = null;
        this.vars._prepare = '';
        this.vars._run = '';
    };

    p.from_string = function(pString) {
        // Parses a definition string.
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var read_run_lines = false;
            var read_prepare_lines = false;
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var tokens = osweb.syntax.split(lines[i]);

                if ((tokens != null) && (tokens.length > 0)) {
                    switch (tokens[0]) {
                        case 'set':
                            this.parse_variable(lines[i]);

                            break;
                        case '__end__':
                            read_run_lines = false;
                            read_prepare_lines = false;

                            break;
                        case '___prepare__':
                            read_prepare_lines = true;

                            break;
                        case '___run__':
                            read_run_lines = true;

                            break;
                        default:
                            if (read_run_lines == true) {
                                this.vars._run = this.vars._run + lines[i] + '\n';
                            } else if (read_prepare_lines == true) {
                                this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                            }
                    }
                } else {
                    if (read_run_lines == true) {
                        this.vars._run = this.vars._run + lines[i] + '\n';
                    } else if (read_prepare_lines == true) {
                        this.vars._prepare = this.vars._prepare + lines[i] + '\n';
                    }
                }
            }
        }
    };

    /*
     * Definition of public methods - running item.         
     */

    p.prepare = function() {
        // Compile the script code to ast trees.
        this._prepare_tree = osweb.parser._prepare(this.vars._prepare);
        this._run_tree = osweb.parser._prepare(this.vars._run);

        // Execute the run code.
        if (this._prepare_tree != null) {
            // Set the current item.
            osweb.events._current_item = this;

            // Set the prepare run toggle.
            this._prepare_run = true;

            // Start the parser
            osweb.parser._run(this, this._prepare_tree);
        } else {
            // Inherited.	
            this.item_prepare();
        }
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Record the onset of the current item.
        this.set_item_onset();

        // Execute the run code.
        if (this._run_tree != null) {
            // Set the prepare run toggle.
            this._prepare_run = false;

            // Start the parser
            osweb.parser._run(this, this._run_tree);
        }
    };

    p.complete = function() {
        // Check if the parser is ready. 
        if (osweb.parser._status == 1) {
            // Process the current active node.
            osweb.parser._process_node();
        } else {
            if (this._prepare_run === true) {
                // Inherited prepare.	
                this.item_prepare();
            } else {
                // Inherited.           
                this.item_complete();
            }
        }
    };

    p.complete_script = function() {
        // Added for video script functionaliry.
        this.complete();
    };

    // Bind the Sequence class to the osweb namespace.
    osweb.inline_script = osweb.promoteClass(inline_script, "item");
}());
/*
 * Definition of the class keyboard_response.
 */

(function() {
    function keyboard_response(pExperiment, pName, pScript) {
        // Inherited create.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._flush = 'yes';
        this._keyboard = new osweb.keyboard(this.experiment);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(keyboard_response, osweb.generic_response);

    // Definition of public properties. 
    p.description = 'Collects keyboard responses';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.auto_response = 'space';
        this.process_feedback = true;
        this.vars.allowed_responses = null;
        this.vars.correct_response = null;
        this.vars.duration = 'keypress';
        this.vars.flush = 'yes';
        this.vars.timeout = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Set the internal flush property.
        this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.generic_response_run();

        // Record the onset of the current item.
        this.set_item_onset();

        // Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush == 'yes') {
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

(function() {
    function logger(pExperiment, pName, pScript) {
        // Inherited create.
        this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._logvars = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(logger, osweb.item);

    // Definition of public properties. 
    p.description = 'Logs experimental data';
    p.logvars = [];

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this._logvars = null;
        this.logvars = [];
        this.vars.auto_log = 'yes';
    };

    p.from_string = function(pString) {
        // Parses a definition string.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'log') && (tokens.length > 0)) {
                        this.logvars.push(tokens[1]);
                    }
                }
            }
        }
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Run item only one time.   
        if (this._status != osweb.constants.STATUS_FINALIZE) {
            // item is finalized.
            this._status = osweb.constants.STATUS_FINALIZE;

            this.set_item_onset();
            if (this._logvars == null) {
                if (this.vars.auto_log == 'yes') {
                    this._logvars = this.experiment._log.all_vars();
                } else {
                    this._logvars = [];
                    for (variable in this.logvars) {
                        if ((variable in this._logvars) == false) {
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

    p.complete = function() {
        // Inherited.	
        this.item_complete();
    };

    // Bind the logger class to the osweb namespace.
    osweb.logger = osweb.promoteClass(logger, "item");
}());
/*
 * Definition of the class loop.
 */

(function() {
    function loop(pExperiment, pName, pScript) {
        // Inherited create.
        this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._break_if = '';
        this._cycles = [];
        this._index = -1;
        this._keyboard = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(loop, osweb.item);

    // Definition of public properties. 
    p.description = 'Repeatedly runs another item';
    p.matrix = null;

    /*
     * Definition of public methods - building cycle.         
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.matrix = {};
        this.vars.cycles = 1;
        this.vars.repeat = 1;
        this.vars.skip = 0;
        this.vars.offset = 'no';
        this.vars.order = 'random';
        this.vars.item = '';
        this.vars.break_if = 'never';
    };

    p.from_string = function(pString) {
        // Creates a loop from a definition in a string.
        this.comments = [];
        this.variables = {};
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens[0] == 'run') && (tokens.length > 1)) {
                        this.vars.item = tokens[1];
                    } else if ((tokens[0] == 'setcycle') && (tokens.length > 3)) {
                        var cycle = tokens[1];
                        var name = tokens[2];
                        var value = osweb.syntax.remove_quotes(tokens[3]);

                        // Check if the value is numeric
                        value = osweb.syntax.isNumber(value) ? Number(value) : value;

                        // Convert the python expression to javascript.
                        if (value[0] == '=') {
                            // Parse the python statement. 
                            value = osweb.parser._prepare(value.slice(1));

                            if (value !== null) {
                                value = value.body[0];
                            }
                        }

                        if (this.matrix[cycle] == undefined) {
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

    p.shuffle = function(list) {
        var i, j, t;
        for (i = 1; i < list.length; i++) {
            j = Math.floor(Math.random() * (1 + i));
            if (j != i) {
                t = list[i];
                list[i] = list[j];
                list[j] = t;
            }
        }
    };

    p.apply_cycle = function(cycle) {
        // Sets all the loop variables according to the cycle.
        if (cycle in this.matrix) {
            for (var variable in this.matrix[cycle]) {
                // Get the value of the variable.
                var value = this.matrix[cycle][variable];

                // Check for python expression.
                if (typeof value === 'object') {
                    // value contains ast tree, run the parser.
                    try {
                        // Evaluate the expression
                        value = osweb.parser._runstatement(value);
                    } catch (e) {
                        // Error during evaluation.
                        osweb.debug.addError('Failed to evaluate ' + value + ' in loop item ' + this.name);
                    }
                }

                // Set the variable.
                this.experiment.vars.set(variable, value);
            }
        }
    };

    p.prepare = function() {
        // Prepare the break if condition.
        if ((this.vars.break_if != '') && (this.vars.break_if != 'never')) {
            this._break_if = this.syntax.compile_cond(this.vars.break_if);
        } else {
            this._break_if = null;
        }

        //  First generate a list of cycle numbers
        this._cycles = [];
        this._index = 0;

        // Walk through all complete repeats
        var whole_repeats = Math.floor(this.vars.repeat);
        for (var j = 0; j < whole_repeats; j++) {
            for (var i = 0; i < this.vars.cycles; i++) {
                this._cycles.push(i);
            }
        }

        // Add the leftover repeats.
        var partial_repeats = this.vars.repeat - whole_repeats;
        if (partial_repeats > 0) {
            var all_cycles = Array.apply(null, {
                length: this.vars.cycles
            }).map(Number.call, Number);
            var remainder = Math.floor(this.vars.cycles * partial_repeats);
            for (var i = 0; i < remainder; i++) {
                // Calculate random position.
                var position = Math.floor(Math.random() * all_cycles.length);
                // Add position to cycles.
                this._cycles.push(position);
                // Remove position from array.
                all_cycles.splice(position, 1);
            }
        }

        // Randomize the list if necessary.
        if (this.vars.order == 'random') {
            this.shuffle(this._cycles);
        } else {
            // In sequential order, the offset and the skip are relevant.
            if (this._cycles.length < this.vars.skip) {
                osweb.debug.addError('The value of skip is too high in loop item ' + this.name + '. You cannot skip more cycles than there are.');
            } else {
                if (this.vars.offset == 'yes') {
                    // Get the skip elements.
                    var skip = this._cycles.slice(0, this.vars.skip);

                    // Remove the skip elements from the original location.
                    this._cycles = this._cycles.slice(this.vars.skip);

                    // Add the skip element to the end.
                    this._cycles = this._cycles.concat(skip);
                } else {
                    this._cycles = this._cycles.slice(this.vars.skip);
                }
            }
        }

        // Create a keyboard to flush responses between cycles.
        this._keyboard = new osweb.keyboard(this.experiment);

        // Make sure the item to run exists.
        if (this.experiment.items._items[this.vars.item] === 'undefined') {
            osweb.debug.addError('Could not find item ' + this.vars.item + ', which is called by loop item ' + this.name);
        }

        // Inherited.	
        this.item_prepare();

        // Set the onset time.
        this.set_item_onset();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        if (this._cycles.length > 0) {
            var exit = false;
            this._index = this._cycles.shift();
            this.apply_cycle(this._index);

            if (this._break_if != null) {
                this.python_workspace['this'] = this;

                var break_if = osweb.syntax.eval_text(this._break_if);

                if (this.python_workspace._eval(break_if) == true) {
                    exit = true;
                }
            }

            if (exit == false) {
                this.experiment.vars.repeat_cycle = 0;

                osweb.item_store.prepare(this.vars.item, this);
                //osweb.item_store.execute(this.vars.item, this);
            } else {
                // Break the loop.
                this.complete();
            }
        } else {
            // Break the loop.
            this.complete();
        }
    };

    p.complete = function() {
        // Check if if the cycle must be repeated.
        if (this.experiment.vars.repeat_cycle == 1) {
            osweb.debug.msg('repeating cycle ' + this._index);

            this._cycles.push(this._index);

            if (this.vars.order == 'random') {
                this.shuffle(this._cycles);
            }
        } else {
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

(function() {
    function mouse_response(pExperiment, pName, pScript) {
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
    p.resp_codes = {};

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.auto_response = 1;
        this.process_feedback = true;
        this.resp_codes = {};
        this.resp_codes['0'] = 'timeout';
        this.resp_codes['1'] = 'left_button';
        this.resp_codes['2'] = 'middle_button';
        this.resp_codes['3'] = 'right_button';
        this.resp_codes['4'] = 'scroll_up';
        this.resp_codes['5'] = 'scroll_down';
        this.vars.allowed_responses = null;
        this.vars.correct_response = null;
        this.vars.duration = 'mouseclick';
        this.vars.flush = 'yes';
        this.vars.show_cursor = 'yes';
        this.vars.timeout = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Set the internal flush property.
        this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.generic_response_run();

        // Record the onset of the current item.
        this.set_item_onset();

        // Show the cursor if defined.
        if (this.vars.show_cursor == 'yes') {
            this._mouse.show_cursor(true);
        }

        // Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush == 'yes') {
            this._mouse.flush();
        }

        this.set_sri();
        this.process_response();
    };

    p.complete = function() {
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

(function() {
    function sampler(pExperiment, pName, pScript) {
        // Inherited.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties.
        this._sample = null;
        this._sampler = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(sampler, osweb.generic_response);

    // Definition of public properties.
    p.block = false;
    p.description = 'Plays a sound file in .wav or .ogg format';

    /*
     * Definition of public methods - build cycle. 
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.block = false;
        this.vars.sample = '';
        this.vars.pan = 0;
        this.vars.pitch = 1;
        this.vars.fade_in = 0;
        this.vars.stop_after = 0;
        this.vars.volume = 1;
        this.vars.duration = 'sound';
    };

    /*
     * Definition of public methods - run cycle. 
     */

    p.prepare = function() {
        // Create the sample
        if (this.vars.sample != '') {
            // Retrieve the content from the file pool.
            this._sample = osweb.pool[this.syntax.eval_text(this.vars.sample)];
            this._sampler = new osweb.sampler_backend(this.experiment, this._sample);
            this._sampler.volume = this.vars.volume;
            this._sampler.duration = this.vars.duration;
            this._sampler.fade = this.vars.fade;
            this._sampler.pan = this.vars.pan;
            this._sampler.pitch = this.vars.pitch;
        } else {
            /* raise osexception(
            u'No sample has been specified in sampler "%s"' % self.name) */
        }

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
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

(function() {
    function sequence(pExperiment, pName, pScript) {
        // Inherited create.
        this.item_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._index = -1;
        this._index_prepare = -1;
        this._items = null;
        this._keyboard = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(sequence, osweb.item);

    // Definition of public properties. 
    p.description = 'Runs a number of items in sequence';
    p.flush_keyboard = 'yes';
    p.items = null;

    /*
     * Definition of public methods - build cycle.         
     */

    p.reset = function() {
        // Resets all item variables to their default value..
        this.items = [];
        this.vars.flush_keyboard = 'yes';
    };

    p.from_string = function(pString) {
        // Parses a definition string.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'run')) {
                        var item = tokens[1];
                        var cond = 'always';
                        if (tokens.length > 2) {
                            cond = tokens[2];
                        }

                        // Push the item and condition definition to the items list.
                        this.items.push({
                            'item': item,
                            'cond': cond
                        });
                    }
                }
            }
        }
    };

    /*
     * Definition of public methods - run cycle.         
     */

    p.prepare = function() {
        // Inherited.	
        this.item_prepare();

        // Create a keyboard to flush responses at the start of the run phase
        if (this.vars.flush_keyboard == 'yes') {
            this._keyboard = new osweb.keyboard(this.experiment);
        } else {
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

    p.prepare_complete = function() {
        // Generate the items list for the run cycle.
        if (this._index < this.items.length) {
            if ((this.items[this._index].item in osweb.item_store._items) === false) {
                osweb.debug.addError('Could not find item ' + this.items[this._index].item.name + ' which is called by sequence item ' + this.name);
            } else {
                // Increase the current index.
                this._index++;

                // Add the item to the internal list.
                this._items.push({
                    'item': this.items[this._index - 1].item,
                    'cond': osweb.syntax.compile_cond(this.items[this._index - 1].cond)
                });

                // Prepare the item.
                osweb.item_store.prepare(this.items[this._index - 1].item, this);
            }
        } else {
            // Prepare process is done, start execution.
            this._index = 0;

            // Remove the prepare phase form the stack.    
            osweb.item_stack.pop();

            // Execute the next cycle of the sequnce itself.
            osweb.item_store.run(this.name, this._parent);
        }
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Check if all items have been processed.
        if (this._index < this._items.length) {
            // Flush the keyboard at the beginning of the sequence.
            if ((this._index == 0) && (this.vars.flush_keyboard == 'yes')) {
                this._keyboard.flush();
            }

            // Increase the current index.
            this._index++;
            var current_item = this._items[this._index - 1]

            // Set the workspace.
            osweb.python_workspace['self'] = this;
            // console.log(current_item.cond);
            // console.log(osweb.runner.experiment.vars);

            // Check if the item may run.                            
            if (osweb.python_workspace._eval(current_item.cond) == true) {
                // run the current item of the sequence object.
                osweb.item_store.run(current_item.item, this);
            } else {
                // Execute the next cycle of the sequnce itself.
                this.run();
            }
        } else {
            // sequence is finalized.
            this.complete();
        }
    };

    p.complete = function() {
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

(function() {
    function sketchpad(pExperiment, pName, pScript) {
        // Set publice properties.
        this.canvas = new osweb.canvas(pExperiment, false);
        this.elements = [];

        // Inherited create.
        this.generic_response_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(sketchpad, osweb.generic_response);

    // Definition of public properties. 
    p.canvas = null;
    p.elements = [];

    /*
     * Definition of private methods - build cycle.         
     */

    p._compare = function(a, b) {
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

    p.reset = function() {
        // Resets all item variables to their default value.
        this.elements = [];
        this.vars.duration = 'keypress';
    };

    p.from_string = function(pString) {
        // Define and reset variables to their defaults.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (pString != null) {
            var lines = pString.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] != '') && (this.parse_variable(lines[i]) == false)) {
                    var tokens = osweb.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] == 'draw')) {
                        if (osweb.isClass(tokens[1]) == true) {
                            var element = osweb.newElementClass(tokens[1], this, lines[i]);
                            this.elements.push(element);
                        } else {
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

    p.prepare = function() {
        // Draw the elements. 
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].is_shown() == true) {
                this.elements[i].draw();
            }
        }

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.generic_response_run();

        // Check if background color needs to be changed
        var background_color = this.vars.get("background")
        if(background_color){
            // In case bgcolor is specified as a single int, convert it to a
            // rgb string
            if(this.canvas.styles.isInt(background_color)){
                var val = background_color;
                background_color = 'rgb('+val+','+val+','+val+')';
            }
            osweb.runner._canvas.style.backgroundColor = background_color;
        }
        // Set the onset and start the stimulus response process.  
        this.set_item_onset(this.canvas.show());
        this.set_sri(false);
        this.process_response();
    };

    p.complete = function() {
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

(function() {
    function feedback(pExperiment, pName, pScript) {
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

    p.reset = function() {
        // Resets all item variables to their default value.
        this.sketchpad_reset();
        this.vars.reset_variables = 'yes';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Prepares the item.
        this._parent.prepare_complete();
    };

    p.run = function() {
        // Inherited.	
        this.sketchpad_prepare();
        this.sketchpad_run();
    };

    p.complete = function() {
        // Inherited.	
        this.sketchpad_complete();

        // Reset feedback variables.
        if (this.vars.reset_variables == 'yes') {
            this.experiment.reset_feedback();
        }
    };

    // Bind the feedback class to the osweb namespace.
    osweb.feedback = osweb.promoteClass(feedback, "sketchpad");
}());
/*
 * Definition of the class synth.
 */

(function() {
    function synth(pExperiment, pName, pScript) {
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

(function() {
    function advanced_delay(pExperiment, pName, pScript) {
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

    p.reset = function() {
        // Resets all item variables to their default value.
        this.vars.duration = 1000;
        this.vars.jitter = 0;
        this.vars.jitter_mode = 'Uniform';
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
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

    p.run = function() {
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

(function() {
    function form_base(pName, pExperiment, pScript, pItem_type, pDescription) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);

        // Set the class private properties.
        this._form_text = false;

        // Set the class public properties.
        this.description = pDescription;
        this.item_type = pItem_type;
    }

    // Extend the class from its base class.
    var p = osweb.extendClass(form_base, osweb.item);

    // Define and set the public properties. 
    p.cols = [];
    p.description = 'A generic form plug-in';
    p.form = null;
    p.rows = [];

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.vars.cols = '2;2';
        this.vars.rows = '2;2';
        this.vars.spacing = 10;
        this.vars._theme = 'gray';
        this.vars.only_render = 'no';
        this.vars.timeout = 'infinite';
        this.vars.margins = '50;50;50;50';
        this._variables = [];
        this._widgets = [];
    };

    p.parse_line = function(pString) {
        // Split the line in tokens.
        var list = this.syntax.split(pString);

        if ((this._form_text == true) && (list[0] != '__end__')) {
            this.vars['form_text'] = this.vars['form_text'] + pString.replace('\t', '');
        };

        // Check for widget definition.
        if (list[0] == 'widget') {
            // Remove widget command.
            list.shift();

            // Add widget to the list.
            this._widgets.push(list);
        } else if (list[0] == '__form_text__') {
            this.vars['form_text'] = '';
            this._form_text = true;
        } else if (list[0] == '__end__') {
            this._form_text = false;
        }

        /* if u'var' in kwdict:
	 self._variables.append(kwdict[u'var'])   */
    };

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
        // Retrieve the column, rows and margins.
        var cols = this.vars.cols.split(';');
        var rows = this.vars.rows.split(';');
        var margins = this.vars.margins.split(';');

        // Get the time out paramter.
        if (this.vars.timeout == 'infinite') {
            var timeout = null;
        } else {
            var timeout = this.vars.timeout;
        }

        // Create the basic form.    
        this.form = new osweb.form(this.experiment, cols, rows, this.vars.spacing, 
            margins, this.vars._theme, this, timeout, this.vars.form_clicks == 'yes');

        for (var i = 0; i < this._widgets.length; i++) {
            this.focus_widget = null;
            var kwdict = {};
            var parameters = [];
            parameters.push(this.form);
            if (this._widgets[i].length > 5) {
                for (var j = 5; j < this._widgets[i].length; j++) {
                    var varName = String(this._widgets[i][j]).substr(0, String(this._widgets[i][j]).indexOf('='));
                    var varValue = String(this._widgets[i][j]).substring(String(this._widgets[i][j]).indexOf('=') + 1, String(this._widgets[i][j]).length);
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
            var _type = this._widgets[i][4];
            var col = this._widgets[i][0];
            var row = this._widgets[i][1];
            var colspan = this._widgets[i][2];
            var rowspan = this._widgets[i][3];

            // Create the widget.
            try {
                var _w = osweb.newWidgetClass(_type, this.form, kwdict);
                //console.log(parameters);
                //var _w = osweb.newWidgetClass(_type, parameters);
            } catch (e) {
                osweb.debug.addError('Failed to create widget ' + _type + ', error:' + e);
            }

            // Set the width position and form.                    
            this.form.set_widget(_w, [col, row], colspan, rowspan);

            // Add as focus widget
            if (focus == true) {
                if (this.focus_widget != null) {
                    osweb.debug.addError('Osweb error: You can only specify one focus widget');
                } else {
                    this.focus_widget = _w;
                }
            }
        }

        // Inherited.   
        this.item_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        console.log(this.form);
        // Set dimensions.
        this.form._parentform.style.width = osweb.runner._canvas.width;
        this.form._parentform.style.height = osweb.runner._canvas.height;
        this.form._parentform.style.background = this.experiment.vars.background;

        // Hide the canvas, show the form.
        osweb.runner._canvas.style.display = 'none';
        this.form._parentform.style.display = 'block';
        this.form._form.style.display = 'block';
    };

    p.complete = function() {
        // Hide the form
        this.form._parentform.style.display = 'none';
        this.form._form.style.display = 'none';
        osweb.runner._canvas.style.display = 'inline';

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

(function() {
    function form_consent(pExperiment, pName, pScript) {
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

    p.run = function() {
        // Inherited.	
        this.form_base_run();
    };

    p.complete = function() {
        // Inherited.	
        this.form_base_complete();
    };

    // Bind the form_consent class to the osweb namespace.
    osweb.form_consent = osweb.promoteClass(form_consent, "form_base");
}());
/*
 * Definition of the class form_multiple_choice.
 */

(function() {
    function form_multiple_choice(pExperiment, pName, pScript) {
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

(function() {
    function form_text_display(pExperiment, pName, pScript) {
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

    p.run = function() {
        // Inherited.	
        this.form_base_run();
    };

    p.complete = function() {
        // Inherited.	
        this.form_base_complete();
    };

    // Bind the form_text_display class to the osweb namespace.
    osweb.form_text_display = osweb.promoteClass(form_text_display, "form_base");
}());
/*
 * Definition of the class form_text_input.
 */

(function() {
    function form_text_input(pExperiment, pName, pScript) {
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

(function() {
    function form_text_render(pExperiment, pName, pScript) {
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

(function() {
    function media_player_vlc(pExperiment, pName, pScript) {
        // Inherited.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Define and set the private properties. 
        this._script_executed = false;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(media_player_vlc, osweb.generic_response);

    // Define and set the public properties. 
    p.description = 'A video player';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
        // Opens the video file for playback.
        this._video = osweb.pool[this.vars.get('video_src')];
        this._video_player = new osweb.video_backend(this.experiment, this._video);

        // Set the inline code options.
        if (this.vars.event_handler !== '') {
            this._video_player._script = osweb.parser._prepare(this.vars.event_handler);
        }
        this._video_player._event_handler_always = (this.vars.event_handler_trigger == 'after every frame');

        // Set the audio option.
        this._video_player.audio = (this.vars.get('playaudio') == 'yes');

        // Set the full screen option (if enabled).
        this._video_player.full_screen = (this.vars.get('resizeVideo') == 'yes');

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Set the onset time.
        this.set_item_onset();
        this.set_sri();

        // Start the video player.
        this._video_player.play();

        // Start response processing.
        this.process_response();
    };

    p.complete = function() {
        if (this._script_executed == false) {
            // Stop the video playing.  
            this._video_player.stop();

            // execute script.
            if ((this._video_player._script !== null) && (this.vars.get('event_handler_trigger') == 'on keypress')) {
                // Set the execute toggle.
                this._script_executed = true;

                // Execute the script code.
                osweb.parser._run(this, this._video_player._script);
            } else {
                // Inherited.	
                this.generic_response_complete();
            }
        } else {
            // Inherited.	
            this.generic_response_complete();
        };
    };

    p.update = function() {
        // Update the video canvas.
        this._video_player._update_video_canvas();
    };

    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());
/*
 * Definition of the class notepad.
 */

(function() {
    function notepad(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(notepad, osweb.item);

    // Define and set the public properties. 
    p.description = 'A simple notepad to document your experiment. This plug-in does nothing.';
    p.note = '';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Show the information of the notepad on the console.
        //osweb.debug.addMessage(this.note);

        // Complete the current cycle.
        this.complete();
    };

    p.complete = function() {
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

(function() {
    function repeat_cycle(pExperiment, pName, pScript) {
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

    p.prepare = function() {
        // Prepare the condtion for which the repeat_cycle must fire.
        this._condition = osweb.syntax.compile_cond(this.vars.get('condition'));

        // Inherited.	
        this.item_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Run item only one time.   
        if (this._status != osweb.constants.STATUS_FINALIZE) {
            if (osweb.python_workspace._eval(this._condition) == true) {
                this.experiment.vars.repeat_cycle = 1;
            }

            // Complete the current cycle.
            this.complete();
        }
    };

    p.complete = function() {
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

(function() {
    function reset_feedback(pExperiment, pName, pScript) {
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

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Run item only one time.   
        if (this._status != osweb.constants.STATUS_FINALIZE) {
            // Run the item.
            this.experiment.reset_feedback();

            // Complete the current cycle.
            this.complete();
        }
    };

    p.complete = function() {
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

(function() {
    function touch_response(pExperiment, pName, pScript) {
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

    p.reset = function() {
        // Inherited.
        this.mouse_response_reset();
        this.vars.set('allowed_responses', null);

        // Resets all item variables to their default value.
        this.vars._ncol = 2;
        this.vars._nrow = 1;
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Temp hack
        this.experiment.vars.correct = -1;

        // Inherited.
        this.mouse_response_prepare();
    };

    p.process_response_mouseclick = function(pRetval) {
        // Processes a mouseclick response.
        this.experiment._start_response_interval = this.sri;
        this.experiment._end_response_interval = pRetval.rtTime;
        this.experiment.vars.response = pRetval.resp;
        this.synonyms = this._mouse.synonyms(this.experiment.vars.response);
        this.experiment.vars.cursor_x = pRetval.event.clientX;
        this.experiment.vars.cursor_y = pRetval.event.clientY;

        var rect = osweb.runner._canvas.getBoundingClientRect();
        if (this.experiment.vars.uniform_coordinates == 'yes') {
            this._x = pRetval.event.clientX + (this.experiment.vars.width / 2);
            this._y = pRetval.event.clientY + (this.experiment.vars.height / 2);
        } else {
            this._x = pRetval.event.clientX - rect.left;
            this._y = pRetval.event.clientY - rect.top;
        }

        // Calulate the row, column and cell. 
        this.col = Math.floor(this._x / (this.experiment.vars.width / this.vars._ncol));
        this.row = Math.floor(this._y / (this.experiment.vars.height / this.vars._nrow));
        this.cell = this.row * this.vars._ncol + this.col + 1;
        this.experiment.vars.response = this.cell;
        this.synonyms = [String(this.experiment.vars.response)];

        // Do the bookkeeping 
        this.response_bookkeeping();
    };

    // Bind the touch_response class to the osweb namespace.
    osweb.touch_response = osweb.promoteClass(touch_response, "mouse_response");
}());
/*
 * Definition of the class base_element.
 */

(function() {
    function base_element(pSketchpad, pScript, pDefaults) {
        // Set the public properties.		
        this.canvas = pSketchpad.canvas;
        this.defaults = pDefaults;
        this.defaults.show_if = 'always';
        this.defaults.z_index = 0;
        this.experiment = pSketchpad.experiment;
        this.fix_coordinates = (pSketchpad.vars.uniform_coordinates == 'yes');
        this.name = pSketchpad.name;
        this.only_keywords = false;
        this.pool = pSketchpad.experiment.pool;
        this.sketchpad = pSketchpad;
        this.syntax = pSketchpad.syntax;
        this.vars = pSketchpad.vars;

        // Set the private properties.		
        this._properties = null;

        // Read the definition string.
        this.from_string(pScript);
    };

    // Extend the class from its base class.
    var p = base_element.prototype;

    // Set the class public properties. 
    p.defaults = {};
    p.fix_coordinates = true;
    p.only_keywords = false;
    p.properties = {};
    p.sketchpad = null;
    p.vars = null;

    /*
     * Definition of public methods - building cycle.         
     */

    p.from_string = function(pString) {
        var tokens = osweb.syntax.parse_cmd(pString);

        // Set the default properties.
        this.properties = {};

        // Set the define properties.
        for (var i = 0; i < tokens.length; i++) {
            var name = tokens[i].slice(0, tokens[i].indexOf('='));
            var value = tokens[i].slice(tokens[i].indexOf('=') + 1, tokens[i].length);
            var value = osweb.syntax.remove_quotes(value);

            // Set (and overwrite) the properties.
            this.properties[name] = value;
        }
    };

    /*
     * Definition of public methods - running cycle.         
     */

    p.z_index = function() {
        //  Determines the drawing order of the elements. 
        return this.properties.z_index;
    };

    p.eval_properties = function() {
        // Evaluates all properties and return them.
        this._properties = {};

        var xc = this.experiment.vars.width / 2;
        var yc = this.experiment.vars.height / 2;

        for (var property in this.properties) {
            var value = this.sketchpad.syntax.eval_text(this.properties[property]);
            /* if var == u'text':
			round_float = True
                else:
			round_float = False
		val = self.sketchpad.syntax.auto_type(
			self.sketchpad.syntax.eval_text(val, round_float=round_float))
		if self.fix_coordinates and type(val) in (int, float): */
            if ((property == 'x') || (property == 'x1') || (property == 'x2')) {
                value = Number(value) + xc;
            };
            if ((property == 'y') || (property == 'y1') || (property == 'y2')) {
                value = Number(value) + yc;
            };

            this._properties[property] = value;
        }
    };

    p.is_shown = function() {
        // Set the self of the current workspace.
        this.experiment.python_workspace['self'] = this.sketchpad;

        // Determines whether the element should be shown, based on the show-if statement.
        return this.experiment.python_workspace._eval(this.experiment.syntax.compile_cond(this.properties['show_if']));
    };

    p.draw = function() {
        // Calculate the dynamic properties.
        this.eval_properties();
    };

    // Bind the base_element class to the osweb namespace.
    osweb.base_element = base_element;
}());
/*
 * Definition of the class arrow.
 */

(function() {
	function arrow(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.arrow_body_length = 0.8;
		this.defaults.arrow_body_width = 0.5;
		this.defaults.arrow_head_width = 30;
		this.defaults.fill = 1;
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x1 = null;
		this.defaults.y1 = null;
		this.defaults.x2 = null;
		this.defaults.y2 = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(arrow, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.fill = this._properties.fill;
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the arrow element to the canvas of the sketchpad.
		this.sketchpad.canvas.arrow(this._properties.x1, this._properties.y1, 
			this._properties.x2, this._properties.y2, this._properties.arrow_body_width, 
			this._properties.arrow_body_length, this._properties.arrow_head_width, 
			styles);
	};

	// Bind the Arrow class to the osweb namespace.
	osweb.arrow = osweb.promoteClass(arrow, "base_element");
}());
/*
 * Definition of the class circle.
 */

(function() {
	function circle(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.fill = 0;
		this.defaults.penwidth = 1;
		this.defaults.x = null;
		this.defaults.y = null;
		this.defaults.r = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(circle, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.fill = this._properties.fill;
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the circle element to the canvas of the sketchpad.
		this.sketchpad.canvas.circle(this._properties.x, this._properties.y, 
			this._properties.r, styles);
	};

	// Bind the Circle class to the osweb namespace.
	osweb.circle = osweb.promoteClass(circle, "base_element");
}());
/*
 * Definition of the class ellipse.
 */

(function() {
	function ellipse(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.fill = 1;
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x = null;
		this.defaults.y = null;
		this.defaults.w = null;
		this.defaults.h = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(ellipse, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.fill = this._properties.fill;
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the ellipse element to the canvas of the sketchpad.
		this.sketchpad.canvas.ellipse(Number(this._properties.x), 
			Number(this._properties.y), Number(this._properties.w), 
			Number(this._properties.h), styles);
	};

	// Bind the ellipse class to the osweb namespace.
	osweb.ellipse = osweb.promoteClass(ellipse, "base_element");
}());
/*
 * Definition of the class fixdot.
 */

(function() {
	function fixdot(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.style = 'default';
		this.defaults.x = null;
		this.defaults.y = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(fixdot, osweb.base_element);

	/*
	 * Definition of public methods - running cycle.         
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.color = this._properties.color;

		// Draw the fixdot element to the canvas of the sketchpad.
		this.sketchpad.canvas.fixdot(this._properties.x, this._properties.y, 
			this._properties.style, styles);
	};

	// Bind the fixdot class to the osweb namespace.
	osweb.fixdot = osweb.promoteClass(fixdot, "base_element");
}());
/*
 * Definition of the class gabor.
 */

(function() {
	function gabor(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.bgmode = 'avg';
		this.defaults.color1 = 'white';
		this.defaults.color2 = 'black';
		this.defaults.env = 'gaussian';
		this.defaults.freq = 1;
		this.defaults.orient = 0;
		this.defaults.phase = 0;
		this.defaults.size = 96;
		this.defaults.stdev = 12;
		this.defaults.x = null;
		this.defaults.y = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(gabor, osweb.base_element);

	/*
	 * Definition of public methods (run cycle).   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

                // Draw the gabor element to the canvas of the sketchpad.
		this.sketchpad.canvas.gabor(this._properties.x, this._properties.y, 
			this._properties.orient, this._properties.freq, this._properties.env,
			this._properties.size, this._properties.stdev, this._properties.phase, 
			this._properties.color1, this._properties.color2, this._properties.bgmode);
	};

	// Bind the gabor class to the osweb namespace.
	osweb.gabor = osweb.promoteClass(gabor, "base_element");
}());
/*
 * Definition of the class image.
 */

(function() {
	function image(pSketchpad, pScript) {
		// Set the class public properties.
		this.defaults = {};
		this.defaults.center = 1;
		this.defaults.file = null;
		this.defaults.scale = 1;
		this.defaults.x = null;
		this.defaults.y = null;

		// Set the class private properties. 
		this._file = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(image, osweb.base_element);

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Retrieve the content from the file pool.
		this._file = osweb.pool[this._properties['file']];

		// Draw the image element to the canvas of the sketchpad.
		this.sketchpad.canvas.image(this._file, this._properties.center, 
			this._properties.x, this._properties.y, this._properties.scale);
	};

	// Bind the image class to the osweb namespace.
	osweb.image = osweb.promoteClass(image, "base_element");
}());
/*
 * Definition of the class line.
 */

(function() {
	function line(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x1 = null;
		this.defaults.y1 = null;
		this.defaults.x2 = null;
		this.defaults.y2 = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(line, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the line element to the canvas of the sketchpad.
		this.sketchpad.canvas.line(this._properties.x1, this._properties.y1, 
			this._properties.x2, this._properties.y2, styles);
	};

	// Bind the line class to the osweb namespace.
	osweb.line = osweb.promoteClass(line, "base_element");
}());
/*
 * Definition of the class noise.
 */

(function() {
    function noise(pSketchpad, pScript) {
        // Set the default properties.
        this.defaults = {};
        this.defaults.color1 = 'white';
        this.defaults.color2 = 'black';
        this.defaults.env = 'gaussian';
        this.defaults.size = 96;
        this.defaults.stdev = 12;
        this.defaults.x = null;
        this.defaults.y = null;
        this.defaults.bgmode = 'avg';

        // Inherited.
        this.base_element_constructor(pSketchpad, pScript, this.defaults);
    }

    // Extend the class from its base class.
    var p = osweb.extendClass(noise, osweb.base_element);

    /*
     * Definition of public methods (run cycle).   
     */

    p.draw = function() {
        // Inherited.	
        this.base_element_draw();

        // Draw the noise element to the canvas of the sketchpad.
        this.sketchpad.canvas.noise( this._properties.x, this._properties.y, 
            this._properties.env, this._properties.size, this._properties.stdev, 
            this._properties.color1, this._properties.color2, this._properties.bgmode );
    };

    // Bind the noise class to the osweb namespace.
    osweb.noise = osweb.promoteClass(noise, "base_element");
}());
/*
 * Definition of the class rect.
 */

(function() {
	function rect(pSketchpad, pScript) {
		// Set the default properties.
		this.defaults = {};
		this.defaults.fill = 1;
		this.defaults.color = pSketchpad.vars.get('foreground');
		this.defaults.penwidth = 1;
		this.defaults.x = null;
		this.defaults.y = null;
		this.defaults.w = null;
		this.defaults.h = null;

		// Inherited.
		this.base_element_constructor(pSketchpad, pScript, this.defaults);
	}

	// Extend the class from its base class.
	var p = osweb.extendClass(rect, osweb.base_element);

	/*
	 * Definition of public methods - run cycle.   
	 */

	p.draw = function() {
		// Inherited.	
		this.base_element_draw();

		// Create a styles object containing style information
		styles = new osweb.Styles();
		styles.fill = this._properties.fill;
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the rectangle element to the canvas of the sketchpad.
		this.sketchpad.canvas.rect(this._properties.x, this._properties.y, 
			this._properties.w, this._properties.h, styles);
	};

	// Bind the Rect class to the osweb namespace.
	osweb.rect = osweb.promoteClass(rect, "base_element");
}());
/*
 * Definition of the class textline.
 */

(function() {
    function textline(pSketchpad, pScript) {
        // Set the default properties.
        this.defaults = {};
        this.defaults.center = 1;
        this.defaults.color = pSketchpad.vars.get('foreground');
        this.defaults.font_family = pSketchpad.vars.get('font_family');
        this.defaults.font_size = pSketchpad.vars.get('font_size');
        this.defaults.font_bold = pSketchpad.vars.get('font_bold');
        this.defaults.font_italic = pSketchpad.vars.get('font_italic');
        this.defaults.html = 'yes';
        this.defaults.text = null;
        this.defaults.x = null;
        this.defaults.y = null;

        // Inherited.
        this.base_element_constructor(pSketchpad, pScript, this.defaults);
    }

    // Extend the class from its base class.
    var p = osweb.extendClass(textline, osweb.base_element);

    /*
     * Definition of public methods - running cycle.         
     */

    p.draw = function() {
        // Inherited.	
        this.base_element_draw();

        // Decode text so unicode is converted properly. 
        var text = decodeURIComponent(escape(this._properties.text));

        // Create a styles object containing style information
        styles = new osweb.Styles();
        styles.color = this._properties.color;
        styles.font_family = this._properties.font_family;
        styles.font_size = this._properties.font_size;
        styles.font_italic = this._properties.font_italic == 'yes';
        styles.font_bold = this._properties.font_bold == 'yes';
        styles.font_underline = this._properties.font_underline == 'yes';

        this.sketchpad.canvas.text(text, this._properties.center, 
            this._properties.x, this._properties.y, this._properties.html, 
            styles);
    };

    // Bind the Text class to the osweb namespace.
    osweb.textline = osweb.promoteClass(textline, "base_element");
}());
	/*
	 * Definition of the class form.
	 */

	(function() {
	    function form(pExperiment, pCols, pRows, pSpacing, pMargins, pTheme, pItem, pTimeout, pClicks) {
	        // Set the class public properties.
	        this.clicks = pClicks;
	        this.experiment = pExperiment;
	        this.height = this.experiment.vars.height;
	        this.item = (pItem != null) ? pItem : pExperiment;
	        this.margins = pMargins;
	        this.spacing = pSpacing;
	        this.span = [];
	        this.timeout = pTimeout;
	        this.widgets = [];
	        this.width = this.experiment.vars.width;

	        // Set the class public properties - columns and rows.
	        var colSize = 0;
	        for (var i = 0; i < pCols.length; i++) {
	            colSize = colSize + Number(pCols[i]);
	        }
	        this.cols = [];
	        for (var i = 0; i < pCols.length; i++) {
	            this.cols.push(Math.round((pCols[i] / colSize) * 100));
	        }
	        var rowSize = 0;
	        for (var i = 0; i < pRows.length; i++) {
	            rowSize = rowSize + Number(pRows[i]);
	        }
	        this.rows = [];
	        for (var i = 0; i < pRows.length; i++) {
	            this.rows.push(Math.round((pRows[i] / rowSize) * 100));
	        }

	        // Set the class private properties.
	        this._parentform = document.getElementById('osweb_form');
	        this._form = document.createElement("DIV");
	        this._form.style.height = '100%';
	        this._form.style.width = '100%';
	        this._form.style.display = 'none';

	        // Set the table properties and content.
	        this._table = document.createElement("TABLE");
	        this._table.style.padding = this.margins[0] + 'px ' + this.margins[1] + 'px ' + this.margins[2] + 'px ' + this.margins[3] + 'px';
	        this._table.style.height = '100%';
	        this._table.style.width = '100%';
	        this._table.style.fontStyle = this.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
	        this._table.style.fontWeight = this.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
	        this._table.style.fontFamily = this.experiment.vars.font_family;
	        this._table.style.color = this.experiment.vars.foreground;
	        this._table.style.fontSize = this.experiment.vars.font_size + 'px';

	        for (var i = 0; i < this.rows.length; i++) {
	            // Insert the row into the table.
	            var row = this._table.insertRow();
	            row.style.height = this.rows[i] + '%';

	            // Inser the cells.
	            for (var j = 0; j < this.cols.length; j++) {
	                var cell = row.insertCell(j);
	                cell.style.width = this.cols[j] + '%';
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
	    p.clicks = null;
	    p.experiment = null;
	    p.height = -1;
	    p.item = null;
	    p.spacing = null;
	    p.timeout = -1;
	    p.width = -1;

	    /*
	     * Definition of public methods - general function.
	     */

	    p._exec = function(pFocus_widget) {};

	    p.timed_out = function() {};

	    p.cell_index = function(pPos) {};

	    p.validate_geometry = function() {};

	    p.get_cell = function(pIndex) {};

	    p.get_rect = function(pIndex) {};

	    p.render = function() {
	        this.validate_geometry();
	        this.canvas.clear();
	        for (var widget in this.widgets) {
	            if (widget !== null) {
	                widget.render();
	            }
	        }

	        this.canvas.show();
	    };

	    p.set_widget = function(pWidget, pPos, pColspan, pRowspan) {
	        // Get the row postition of the widget.
	        var row = this._table.rows[Number(pPos[1])];
	        var cell = row.cells[Number(pPos[0])];
	        if (Number(pColspan) > 1) {
	            cell.colSpan = Number(pColspan);
	        }
	        if (Number(pRowspan) > 1) {
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

	    p.xy_to_index = function(pXy) {};

	    // Bind the form class to the osweb namespace.
	    osweb.form = form;
	}());
	/*
	 * Definition of the class widget.
	 */

	(function() {
	    function widget(pForm) {
	        // Set the class public properties.
	        this.focus = false;
	        this.form = pForm;
	        this.rect = null;
	        this.type = 'widget';
	        this.vars = null;
	    }

	    // Extend the class from its base class.
	    var p = widget.prototype;

	    // Definition of class public properties. 
	    p.form = null;
	    p.focus = false;
	    p.rect = null;
	    p.type = '';
	    p.vars = null;

	    /*
	     * Definition of public methods - general function.
	     */

	    p.box_size = function() {
	        return null;
	    };

	    p.theme_engine = function() {
	        return null;
	    };

	    p.draw_frame = function(pRect, pStyle) {};

	    p.on_mouse_click = function(pevent) {};

	    p.render = function() {};

	    p.set_rect = function(pRect) {};

	    p.set_var = function(pVal, pVar) {
	        // Sets an experimental variable.
	        if (pVar == null) {
	            pVar = this.vars;
	        }

	        if (pVar != null) {
	            this.form.experiment.vars.set(pVar, pVal);
	        }
	    };

	    // Bind the widget class to the osweb namespace.
	    osweb.widget = widget;
	}());
/*
 * Definition of the class button.
 */

(function() {
    function button(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class private properties.
        this._element = document.createElement("BUTTON");
        this._element.style.width = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';

        // Add event listener to the element.
        this._element.addEventListener("click", this.response.bind(this));

        // Set the class public properties.
        this.center = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false;
        this.frame = (typeof pProperties['frame'] == 'boolean') ? pProperties['frame'] : false;
        this.tab_str = '    ';
        this.type = 'button';
        this.x_pad = 8;
        this.y_pad = 8;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(button, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = null;
    p.tab_str = '';
    p.text = '';
    p.x_pad = 0;
    p.y_pad = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.response = function(event) {
        console.log(this);
        // Complete the parent form.
        this.form.item.complete();
    };

    p.draw_text = function(pText, pHtml) {
        // Draws text inside the widget.
        pText = this.form.experiment.syntax.eval_text(pText);
        pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true) {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        } else {
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }

        var w = this.rect.w - 2 * this.x_pad;

        this.form.canvas.text(pText, this.center, x, y, w, pHtml);
    };

    p.render = function() {
        // Draws the widget.
        if (this.frame == true) {
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

(function() {
    function checkbox(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class private properties.
        this._element = document.createElement("LABEL");
        this._element_check = document.createElement("INPUT");
        this._element_check.setAttribute("type", "checkbox");
        this._element.style.width = '100%';
        this._element.style.height = '100%';
        this._element.textContent = pProperties['text'];

        //this._element.innerHTML        = pProperties['text'];
        this._element.style.fontStyle = this.form.experiment.vars.font_italic == 'yes' ? 'italic' : 'normal';
        this._element.style.fontWeight = this.form.experiment.vars.font_bold == 'yes' ? 'bold' : 'normal';
        this._element.style.fontFamily = this.form.experiment.vars.font_family;
        this._element.style.color = this.form.experiment.vars.foreground;
        this._element.style.fontSize = this.form.experiment.vars.font_size + 'px';
        this._element.appendChild(this._element_check);

        // Add event listener to the element.
        this._element.addEventListener("click", this.on_mouse_click.bind(this));

        console.log('---');
        console.log(pProperties);

        // Set the class public properties.
        this.click_accepts = (typeof pProperties.click_accepts === 'undefined') ? false : pProperties.click_accepts;
        this.group = (typeof pProperties.group === 'undefined') ? null : pProperties.group;
        this.type = 'checkbox';
        this.var = (typeof pProperties.var === 'undefined') ? null : pProperties.var;
        this.checked = (typeof pProperties.checked === 'checked') ? false : pProperties.checked;

        // Set the current status of the checkbox.
        this.set_var(this.checked);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(checkbox, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = null;
    p.tab_str = '';
    p.text = '';
    p.x_pad = 0;
    p.y_pad = 0;

    /*
     * Definition of public class methods.
     */

    p.on_mouse_click = function(event) {
        console.log('checkbox clicked');

    };

    // Bind the checkbox class to the osweb namespace.
    osweb.checkbox = osweb.promoteClass(checkbox, "widget");
}());
/*
 * Definition of the class label.
 */

(function() {
    function label(pForm, pProperties) {
        // Inherited create.
        this.widget_constructor(pForm);

        // Set the class private properties.
        this._element = document.createElement("SPAN");
        this._element.innerHTML = pProperties['text'];

        // Set the class public properties.
        this.center = (typeof pProperties['center'] == 'boolean') ? pProperties['center'] : false;
        this.frame = (typeof pProperties['frame'] == 'boolean') ? pProperties['frame'] : false;
        this.tab_str = '    ';
        this.type = 'label';
        this.x_pad = 8;
        this.y_pad = 8;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(label, osweb.widget);

    // Definition of public properties. 
    p.center = false;
    p.frame = false;
    p.tab_str = '';
    p.text = '';
    p.x_pad = 0;
    p.y_pad = 0;

    /*
     * Definition of public class methods - build cycle.
     */

    p.draw_text = function(pText, pHtml) {
        // Draws text inside the widget.
        pText = this.form.experiment.syntax.eval_text(pText);
        pText = safe_decode(pText).replace('\t', this.tab_str);

        if (this.center == true) {
            var x = this.rect.x + this.rect.w / 2;
            var y = this.rect.y + this.rect.h / 2;
        } else {
            var x = this.rect.x + this.x_pad;
            var y = this.rect.y + this.y_pad;
        }

        var w = this.rect.w - 2 * this.x_pad;
        this.form.canvas.text(pText, this.center, x, y, pHtml);
    };

    p.render = function() {
        // Draws the widget.
        if (this.frame == true) {
            this.draw_frame(this.rect);
        }

        this.draw_text(this.text);
    };

    // Bind the label class to the osweb namespace.
    osweb.label = osweb.promoteClass(label, "widget");
}());
(function() {
    // Class events - processing all user and system evens within osweb.
    function events() {
        throw 'The class events cannot be instantiated!';
    };

    // Definition of private properties.
    events._active = false; // If true event processing is active.
    events._break = false; // If true the experiment is forced to stop.
    events._caller = null; // The caller object (clock, keyboard, mouse).
    events._current_item = null; // Contain the current active item. 			
    events._keyboard_mode = osweb.constants.PRESSES_ONLY; // Keyboard collecting mode (down/up/both).
    events._keyboard_event = null; // Contains the last known keyboard event.
    events._mouse_mode = osweb.constants.PRESSES_ONLY; // Mouse collecting mode (down/up/both).
    events._mouse_move = null; // Contains the last known mouse move event (used within the mouse class).
    events._mouse_press = null; // Contains the last known mouse press event (used within the mouse class).	
    events._response_given = false; // Valid response toggle
    events._response_type = -1; // Set type of response (0 = none, 1 = keyboard, 2 = mouse, 3 = sound). 
    events._response_list = null; // Items to respond on.
    events._sound_ended = false; // Sound play is finished.
    events._timeout = -1; // Duration for timeout.
    events._video_ended = false; // Video play is finished.

    // Definition of the conversion table to convert keycodes to OpenSesame codes.
    events.KEY_CODES = ['', '', '', '', '', '', 'help', '', 'backspace', 'tab', '', '', 'clear', 'enter', 'enter_special', '', 'shift', 'ctrl', 'alt', 'pause', // 00  .. 19
        'caps', '', '', '', '', '', '', 'escape', '', '', '', '', 'space', 'page up', 'page down', 'end', 'home', 'left', 'up', 'right', // 20  .. 39
        'down', 'select', 'print', 'execute', 'print screen', 'insert', 'delete', '', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', // 40  .. 59
        '<', '=', '>', '?', '@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // 60  .. 79
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'left meta', 'right meta', 'menu', '', '', 'kp0', 'kp1', 'kp2', 'kp3', // 80  .. 99
        'kp4', 'kp5', 'kp6', 'kp7', 'kp8', 'kp9', 'kp_multiply', 'kp_plus', '', 'kp_minus', 'kp_period', 'kp_divide', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', // 100 .. 119
        'f9', 'f10', 'f11', 'f12', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 120 .. 139
        '', '', '', '', 'numlock', 'scrollock', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 140 .. 159
        '^', '!', '"', '#', '$', '%', '&', '_', '(', ')', '*', '+', '|', '_', '{', '}', '~', '', '', '', // 160 .. 179
        '', '', '', '', '', '', ';', '=', ',', '-', '.', '/', '`', '', '', '', '', '', '', '', // 180 .. 199
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '[', // 200 .. 219
        '\\', ']', '\'', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 220 .. 239
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]; // 240 .. 255
    // Definition of the conversion table to convert shift keycodes to OpenSesame codes.
    events.KEY_SCODES = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pause', // 00  .. 19
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 20  .. 39
        '', '', '', '', '', '', '', '', ')', '!', '@', '#', '$', '%', '^', '&', '*', '(', '', ':', // 40  .. 59
        '', '+', '', '', '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', // 60  .. 79
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', '', '', '', '', '', '', '', '', '', '', // 80  .. 99
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 100 .. 119
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 120 .. 139
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 140 .. 159
        '', '', '', '', '', '', '', '', '', '', '', '', '', '_', '', '', '', '', '', '', // 160 .. 179
        '', '', '', '', '', '', '', '', '<', '', '>', '?', '~', '', '', '', '', '', '', '', // 180 .. 199
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '{', // 200 .. 219
        '|', '}', '"', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 220 .. 239
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]; // 240 .. 255

    // Definition of methods for general event processing.    

    events._initialize = function() {
        // Initialize the keyboard event listeners.
        window.addEventListener("keydown", this._keyDown.bind(this), false);
        window.addEventListener("keyup", this._keyUp.bind(this), false);

        // Initialize the mouse event listeners.
        osweb.runner._canvas.addEventListener("mousedown", this._mouseDown.bind(this), false);
        osweb.runner._canvas.addEventListener("mousemove", this._mouseMove.bind(this), false);
        osweb.runner._canvas.addEventListener("mouseup", this._mouseUp.bind(this), false);

        // Initialize the mouse context event listeners.
        osweb.runner._canvas.addEventListener("contextmenu", this._mouseContext.bind(this), false);

        // Initialize the tick event listener.
        createjs.Ticker.setInterval(15);
        createjs.Ticker.addEventListener("tick", this._tick.bind(this));
    };

    events._finalize = function() {
        // Finalize the tick event listener.             
        createjs.Ticker.removeEventListener("tick");

        // Finalize the mouse context event listeners.
        osweb.runner._canvas.removeEventListener("contextmenu", this._mouseContext, false);

        // Finalize the mouse event listeners.
        osweb.runner._canvas.removeEventListener("mousedown", this._mouseDown, false);
        osweb.runner._canvas.removeEventListener("mousemove", this._mouseMove, false);
        osweb.runner._canvas.removeEventListener("mouseup", this._mouseUp, false);

        // Finalize the keyboard event listeners.
        window.removeEventListener("keydown", this._keyDown, false);
        window.removeEventListener("keyup", this._keyUp, false);
    };

    events._run = function(caller, timeout, response_type, response_list) {
        // Set the event running properties.     
        this._caller = caller;
        this._response_list = response_list;
        this._response_type = response_type;
        this._timeout = timeout;

        // Activate the event running.  
        this._response_given = false;
        this._sound_ended = false;
        this._video_ended = false;
        this._active = true;
    };

    events._update = function() {
        // Check if the duration is finished.
        if (((this._timeout === -1) && ((this._response_given === true) || (this._sound_ended === true) || (this._video_ended === true))) ||
            ((this._timeout > 0) && ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) || (this._response_type === osweb.constants.RESPONSE_MOUSE)) && (this._response_given === true)) ||
            (((this._timeout > 0) && (this._current_item.clock.time() - this._current_item.experiment.vars.get('time_' + this._current_item.name)) > this._timeout))) {
            // Set the status of the current item to finalize.
            this._current_item._status = osweb.constants.STATUS_FINALIZE;
        } else {
            // Update the current item.
            this._current_item.update();
        }
    };

    events._complete = function() {
        // Disable the ticker
        this._active = false;

        // Remove the items from the general stack.
        osweb.item_stack.pop();

        // Execute the post-run phase after duration is finished or response is received.
        this._current_item.complete();
    };

    // Definition of methods for keyboard event processing.

    events._convertKeyCode = function(event) {
        // Check for special characters
        var key = '';
        if ((event.shiftKey === true) && (event.keyCode !== 16)) {
            // Shift key pressed with other key, so convert shift keys.
            key = this.KEY_SCODES[event.keyCode];
        } else if ((event.shiftKey === true) && (event.keyCode === 16)) {
            // Shift code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lshift' : 'rshift';
        } else if ((event.ctrlKey === true) && (event.keyCode === 17)) {
            // Ctrl code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lctrl' : 'rctrl';
        } else if ((event.altKey === true) && (event.keyCode === 18)) {
            // Alt code pressed, check for location (left or right)
            key = (event.location == 1) ? 'lalt' : 'ralt';
        } else {
            // Convert standard keycode.
            key = this.KEY_CODES[event.keyCode];
        }

        // Return function result.
        return key;
    };

    events._keyDown = function(event) {
        // Store the keyboard event.    
        this.keyboard_event = event;

        // Only select this event when the collection mode is set for this.
        if ((this._keyboard_mode === osweb.constants.PRESSES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processKeyboardEvent(event, 1);
        }
    };

    events._keyUp = function(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._keyboard_mode === osweb.constants.RELEASES_ONLY) || (this._keyboard_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processKeyboardEvent(event, 0);
        }
    };

    events._processKeyboardEvent = function(event, keyboard_state) {
        // Create a new keyboard response object.
        var KeyboardResponses = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time(),
            'state': keyboard_state,
            'type': osweb.constants.RESPONSE_KEYBOARD
        };

        // Convert response to proper keyboard token. 
        KeyboardResponses.resp = this._convertKeyCode(event);

        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_KEYBOARD) && ((this._response_list === null) || (this._response_list.indexOf(KeyboardResponses.resp) >= 0))) {
            // Process the current item.
            if (this._current_item !== null) {
                // Process the response.
                this._current_item.update_response(KeyboardResponses);
            }

            // Set the valid response given toggle.
            this._response_given = true;
        }
    };

    // Definition of methods for mouse event processing.

    events._mouseContext = function(event) {
        // Prevent default action. 
        event.preventDefault();

        // Return false to prevent the context menu from pushing up.
        return false;
    };

    events._mouseDown = function(event) {
        // Store the mouse press status for use in the mousee class.
        this._mouse_press = event;

        // Only select this event when the collection mode is set for this.
        if ((this._mouse_mode === osweb.constants.PRESSES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processMouseEvent(event, 1);
        }
    };

    events._mouseMove = function(event) {
        // Store the mouse move event and its timestamp for use in the mouse class.
        this._mouse_move = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time()
        };
    };

    events._mouseUp = function(event) {
        // Only select this event when the collection mode is set for this.
        if ((this._mouse_mode === osweb.constants.RELEASES_ONLY) || (this._mouse_mode === osweb.constants.PRESSES_AND_RELEASES)) {
            // Process the event.
            this._processMouseEvent(event, 0);
        }
    };

    events._processMouseEvent = function(event, mouse_state) {
        // Create a new mouse response object.
        var MouseResponses = {
            'event': event,
            'rtTime': osweb.runner.experiment.clock.time(),
            'state': mouse_state,
            'type': osweb.constants.RESPONSE_MOUSE
        };

        // Adjust mouse response.  
        MouseResponses.resp = String(event.button + 1);

        // Process the response to the current object.
        if ((this._response_type === osweb.constants.RESPONSE_MOUSE) && ((this._response_list === null) || (this._response_list.indexOf(MouseResponses.resp) >= 0))) {
            // Process the response to the current object.
            if (this._current_item !== null) {
                this._current_item.update_response(MouseResponses);
            }

            // Set the valid response given toggle.
            this._response_given = true;
        }
    };

    // Definition of methods for sound event processing.

    events._audioEnded = function(event) {
        // If duration isequal to sound exit the sound item.
        var sampler = this;
        if(sampler.duration == "sound"){
            osweb.events._sound_ended = true;
        }
    };

    // Definition of methods for video event processing.

    events._videoEnded = function() {
        osweb.events._video_ended = true;
    };

    events._videoPlay = function(event) {};

    // Definition of methods for tick event processing (timing).

    events._tick = function(event) {
        // Check if the exit flag is set
        if (this._break === true)
        {
            // Prevent firing double.
            this._break = false;
            
            // Disable the ticker.
            this._active = false;
            
            // End the experiment
            osweb.runner.experiment.end();
        }
        else if ((this._current_item !== null) && (this._active === true)) {
            // Only check for status if there is a current item and the ticker is activated.
            switch (this._current_item._status) {
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
(function() {
    // Definition of the class functions.
    function functions() {
        throw 'The class functions cannot be instantiated!';
    }

    // Definition of private methods.   

    functions._initialize = function() {
        // Create the general function calls for use in the inlide script item.
        window['print'] = this.print;
        window['randint'] = this.randint;
    };

    // Definition of public methods - global inline functions.

    functions.print = function(text) {
        console.log('print output:' + text);
    };

    functions.randint = function(start, end) {
        var multiplier = end - start;
        var rand = Math.floor(Math.random() * multiplier);
        return rand + start;
    };

    // Bind the functions class to the osweb namespace.
    osweb.functions = functions;
}());
(function() {
    // Definition of the class Parameters.
    function parameters() {
        throw 'The class parameters cannot be instantiated!';
    }

    // Define the private properties. 
    parameters._itemCounter = 0;
    parameters._parameters = new Array();

    // Define the public properties. 
    parameters.displaySummary = false;
    parameters.useDefaultValues = false;

    // Definition of private methods - initialize parameters.   

    parameters._initialize = function() {
        // Set properties if defined.
        var parameter = {
            dataType: '0',
            defaultValue: '0',
            name: 'subject_nr',
            title: 'Starting the experiment',
            prompt: 'Please enter the subject number',
            promptEnabled: true
        };

        // Add the subject parameter to the parameters list.
        this._parameters.push(parameter);
        
        // Process the Parameters.        
        this._processParameters();
    };

    // Definition of private methods - process parameters.   

    parameters._processParameters = function() {
        // Process all items for which a user input is required.
        if (this._itemCounter < this._parameters.length) {
            // Process the Parameter.
            if (this.useDefaultValues == false) {
                this._processParameter(this._parameters[this._itemCounter]);
            } else {
                // Transfer the startup info to the context.
                this._transferParameters();
            }
        } else {
            // All items have been processed, contine the Runner processing.
            if (this.displaySummary == true) {
                // Show a summary of the the startup information. 
                this._showParameters();
            } else {
                // Transfer the startup info to the context.
                this._transferParameters();
            }
        }
    };

    parameters._processParameter = function(parameter) {
        // Check if a user request is required.
        if (parameter.promptEnabled == true) {
            if(parameter.dataType !== "0"){
                document.getElementById('qpbuttonyes').onclick = function() {
                    //Get the response information
                    parameter.response = value;
                    // Close the dialog.
                    this._hideDialog();
                    // Increase the counter.
                    this._itemCounter++;
                    // Continue processing.
                    this._processParameters();
                }.bind(this);

                document.getElementById('qpbuttonno').onclick = function() {
                    // Close the dialog.
                    this._hideDialog();

                    // Finalize the introscreen elements.
                    osweb.runner._exit();
                }.bind(this);
            }
            this._showDialog(parameter);
        } else {
            // Assign default value to the Startup item.
            parameter.response = parameter.defaultValue;

            // Increase the counter.
            this._itemCounter++;

            // Continue processing.
            this._processParameters();
        }
    };

    parameters._showParameters = function() {
        document.getElementById('dialogboxhead').innerHTML = 'Summary of startup info';
        document.getElementById('qpbuttonyes').onclick = function() {
            // Close the dialog.
            this._hideDialog();

            // Transfer the startup info to the context.
            this._transferParameters();

        }.bind(this);

        document.getElementById('qpbuttonno').onclick = function() {
            // Close the dialog.
            this._hideDialog();

            // Reset the item counter.
            this._itemCounter = 0;

            // Restat the input process.    
            this._processParameters();

        }.bind(this);

        document.getElementById('qpbuttoncancel').onclick = function() {
            // Close the dialog.
            this._hideDialog();

            // Finalize the introscreen elements.
            osweb.runner._exit();
        }.bind(this);

        // Set the dialog interface.
        var TmpString = '';
        for (var i = 0; i < this._parameters.length; i++) {
            if ((this._parameters[i].enabled != 0) && (this._parameters[i].promptEnabled != 0)) {
                TmpString = TmpString + this._parameters[i].name + ': ' + this._parameters[i].response + '\r\n';
            }
        }

        document.getElementById('qpdialogtextarea').innerHTML = TmpString;
    };

    parameters._transferParameters = function() {
        // Transfer the startup info items to the context.
        for (var i = 0; i < this._parameters.length; i++) {
            osweb.runner.experiment.vars.set(this._parameters[i].name, this._parameters[i].response);
        }
        // Parameters are processed, next phase.
        osweb.screen._setupClickScreen();
    };

    // Definition of class methods (dialogs).   

    parameters._showDialog = function(parameter) {
        var dialogtype = parameter.dataType;

        // I don't know what the dialogtypes other than 0 signify, so I only integrated
        // type 0 with alertify.js
        if(dialogtype !== "0"){
            var dialogoverlay = document.getElementById('dialogoverlay');
            var dialogbox = document.getElementById('dialogbox');

            dialogoverlay.style.display = "block";
            dialogbox.style.display = "block";
        }

        switch (dialogtype) {
            case "0":
                alertify.prompt( 
                    parameter.title, 
                    parameter.prompt, 
                    parameter.defaultValue, 
                    function(evt, value) {
                        // Get the response information
                        parameter.response = value;
                        // Increase the counter.
                        this._itemCounter++;
                        // Continue processing.
                        this._processParameters();
                    }.bind(this), 
                    function() {
                        // Finalize the introscreen elements.
                        osweb.runner._exit();
                    }
                );
                // document.getElementById('dialogboxbody').innerHTML = '<input id="qpdialoginput"></input>';
                // document.getElementById('dialogboxfoot').innerHTML = '<button id="qpbuttonyes">Ok</button><button id="qpbuttonno">Cancel</button>';
                // document.getElementById('qpdialoginput').focus();
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

    parameters._hideDialog = function() {
        dialogoverlay.style.display = "none";
        dialogbox.style.display = "none";
        document.getElementById('dialogboxbody').innerHTML = '';
        document.getElementById('dialogboxfoot').innerHTML = '';
    };

    /**
     * Resizes the container div (osweb_div), which contains all elements on display
     * @param  {int} width  width to set
     * @param  {int} height height to set
     * @return void
     */
    parameters._resizeOswebDiv = function(width, height) {
        document.getElementById('osweb_div').style.width = width + 'px';
        document.getElementById('osweb_div').style.height = height + 'px';
    }

    // Bind the parameters class to the osweb namespace.
    osweb.parameters = parameters;
}());
(function() {
    // Definition of the class session.
    function parser() {
        throw 'The class parser cannot be instantiated!';
    }

    // Definition of private properties.
    parser._ast_tree = null;
    parser._current_node = null;
    parser._inline_script = null;
    parser._status = 0;

    // Definition of private methods - prepare cycle.   

    parser._prepare = function(script) {
        if (script !== '') {
            var locations = false;
            var parseFn = filbert_loose.parse_dammit;
            var ranges = false;

            try {
                var code = script;
                var ast = parseFn(code, {
                    locations: locations,
                    ranges: ranges
                });
                return ast;
            } catch (e) {
                console.log('error');
                console.log(e.toString());
                return null;
            }
        } else {
            return null;
        }
    };

    // Definition of private methods - general parser functions.

    parser._set_return_value = function(node, value) {
        var index = 0;
        while (typeof node['returnvalue' + String(index)] !== 'undefined') {
            index++;
        }

        // Set the return value\
        node['returnvalue' + String(index)] = value;
    };

    // Definition of private methods - node processing.

    parser._node_array_expression = function()
    {
        // Initialize node properties. 
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index;
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Process arguments.
                if (this._current_node.index < this._current_node.elements.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.elements[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.elements[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } else {
                    // Set parent node.
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
            break;
            case 1:
                // Create and set the returnvalue.
                returnvalue = new Array();
                if (this._current_node.index > 0) {
                    for (var i=0;i < this._current_node.index;i++) {
                        returnvalue.push(this._current_node['returnvalue' + String(i)]);
                    }
                }   
                this._set_return_value(this._current_node.parent, returnvalue);

                // Reset status of node and return to the parten node to process.
                this._current_node.index = 0;
                this._current_node.status = 0;
                this._current_node = this._current_node.parent;
                this._process_node();
            break;    
        }    
    };

    parser._node_assignment_expression = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // process right expression;
                this._current_node.status = 1;
                this._current_node.right.parent = this._current_node;
                this._current_node = this._current_node.right;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 1:
                // process right expression;
                this._current_node.status = 2;
                this._current_node.left.parent = this._current_node;
                this._current_node = this._current_node.left;

                // Return to the node processessor.
                this._process_node();
            break;    
            case 2:
                // Perform the assignment.
                switch (typeof this._current_node.returnvalue1) {
                    case 'object': 
                        switch (this._current_node.returnvalue1.obj) {
                            case 'var': 
                                osweb.runner.experiment.vars[this._current_node.returnvalue1.prop] = this._current_node.returnvalue0;
                                console.log(osweb.runner.experiment.vars);
                            break
                    }    
                    break;
                }    
                
                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        }          
    }; 

    parser._node_binary_expression = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // process right expression;
                this._current_node.status = 1;
                this._current_node.right.parent = this._current_node;
                this._current_node = this._current_node.right;

                // Return to the node processessor.
                this._process_node();
                break;
            case 1:
                // process right expression;
                this._current_node.status = 2;
                this._current_node.left.parent = this._current_node;
                this._current_node = this._current_node.left;

                // Return to the node processessor.
                this._process_node();
                break;
            case 2:
                var left, right;
                if (typeof window[this._current_node.returnvalue0] === 'undefined') {
                    var right = this._current_node.returnvalue0;
                } else {
                    var right = window[this._current_node.returnvalue0];
                }
                var left, right;
                if (typeof window[this._current_node.returnvalue1] === 'undefined') {
                    var left = this._current_node.returnvalue1;
                } else {
                    var left = window[this._current_node.returnvalue1];
                }

                // Select the binary operator to perform.
                switch (this._current_node.operator) {
                    case '-':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left - right);
                    break;
                    case '/':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left / right);
                    break;
                    case '==':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left === right);
                    break;
                    case '!=':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left !== right);
                    break;
                    case '>':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left > right);
                    break;
                    case '<':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left < right);
                    break;
                    case '>=':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left >= right);
                    break;
                    case '<=':
                        // Process call - check for blocking methods.
                        this._set_return_value(this._current_node.parent, left <= right);
                    break;
                    default:
                        console.log('script error: no valid binary operator.');
                }

                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
            break;
        }
    };

    parser._node_call_expression = function() {
        // Initialize status property.
        this._current_node.arguments = (typeof this._current_node.arguments === 'undefined') ? [] : this._current_node.arguments;
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index;
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Process arguments.
                if (this._current_node.index < this._current_node.arguments.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.arguments[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.arguments[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } else {
                    // Set parent node.
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
                break;
            case 1:
                // Process method.
                this._current_node.status = 2;
                this._current_node.callee.parent = this._current_node;
                this._current_node = this._current_node.callee;

                // Return to the node processessor.
                this._process_node();
                break;
            case 2:
                // Set status of node.
                this._current_node.status = 3;

                // Create the aruments array.
                var tmp_arguments = [];
                for (var i = 0; i < this._current_node.arguments.length; i++) {
                    if (typeof window[this._current_node['returnvalue' + String(i)]] !== 'undefined') {
                        tmp_arguments.push(window[this._current_node['returnvalue' + String(i)]]);
                    } else {
                        tmp_arguments.push(this._current_node['returnvalue' + String(i)]);
                    }
                }

                // Select the type of call to process
                var callee = this._current_node['returnvalue' + String(this._current_node.arguments.length)];
                var returnvalue = null;
                
                if (callee.type == 'function') {
                    // process special expression methods
                    switch (callee.obj) { 
                        case 'add': 
                            returnvalue = tmp_arguments[1] + tmp_arguments[0];
                        break;
                        case 'multiply': 
                            returnvalue = tmp_arguments[1] * tmp_arguments[0];
                        break;    
                        default:
                            // function call
                            returnvalue = window[callee.obj].apply(null, tmp_arguments);
                        break;        
                    }
                    
                    // Set return value for the parent node.     
                    this._set_return_value(this._current_node.parent, returnvalue);

                    // Return to the node processessor.
                    this._process_node();
                } else if (callee.type == 'object') {
                    if ((callee.obj == 'clock') && (callee.prop == 'sleep')) {
                        // Process special calls with blocking (no direct result processing).
                        window[callee.obj][callee.prop].apply(window[callee.obj], tmp_arguments);
                    } else {
                        // object methods calls.
                        returnvalue = window[callee.obj][callee.prop]();

                        // Process call - check for blocking methods.
                        this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;

                        // Return to the node processessor.
                        this._process_node();
                    }
                } else {
                    switch (callee) {
                        case 'canvas':
                            returnvalue = new osweb.canvas();
                            break;
                    }

                    // Process call - check for blocking methods.
                    this._current_node.parent['returnvalue' + String(this._current_node.arguments.length)] = returnvalue;

                    // Return to the node processessor.
                    this._process_node();
                }
                break;
            case 3:
                // Set parent node.
                this._current_node.status = 4;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
                break;
        }
    };

    parser._node_empty_statement = function() {
        // Process empty statement, return to parent.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_expression_statement = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Set parent node.
                this._current_node.status = 1;
                this._current_node.expression.parent = this._current_node;
                this._current_node = this._current_node.expression;

                // Return to the node processessor.
                this._process_node();
                break;
            case 1:
                // Set parent node.
                this._current_node.status = 2;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
                break;;
        }
    };

    parser._node_identifier = function() {
        // Check for pre-defined global classes (var, exp e.d.) 
        if ((this._current_node.name in ['items','pool','responses','var'] === false) && (typeof window[this._current_node.name] === 'undefined')) {
            // Item is undefined, create it without value/type definition.
            window[this._current_node.name] = null;
        }

        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.name);

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_literal = function() {
        // Set the return value.
        this._set_return_value(this._current_node.parent, this._current_node.value);

        // Set parent node.
        this._current_node = this._current_node.parent;

        // Return to the node processessor.
        this._process_node();
    };

    parser._node_member_expression = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Process object.
                this._current_node.status = 1;
                this._current_node.object.parent = this._current_node;
                this._current_node = this._current_node.object;

                // Return to the node processessor.
                this._process_node();
                break;
            case 1:
                // Process object.
                this._current_node.status = 2;
                this._current_node.property.parent = this._current_node;
                this._current_node = this._current_node.property;

                // Return to the node processessor.
                this._process_node();
                break;
            case 2:
                // Set the return value.
                //console.log('member->');
                //console.log(typeof this._current_node.returnvalue0);

                if (typeof this._current_node.returnvalue0 == 'object') {
                    this._set_return_value(this._current_node.parent, {
                        'obj': this._current_node.returnvalue1,
                        'prop': null,
                        'type': 'function'
                    });
                } else {
                    this._set_return_value(this._current_node.parent, {
                        'obj': this._current_node.returnvalue0,
                        'prop': this._current_node.returnvalue1,
                        'type': 'object'
                    });
                }

                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
                break;
        }
    };
    
    parser._node_new_expression = function() {
        // Initialize status and index properties.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Process method.
                this._current_node.status = 1;
                this._current_node.callee.parent = this._current_node;
                this._current_node = this._current_node.callee;

                // Return to the node processessor.
                this._process_node();
            break;
            case 1:
                // Process arguments.
                if (this._current_node.index < this._current_node.arguments.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.arguments[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.arguments[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } 
                else {
                    // Set parent node.
                    this._current_node.status = 2;
                
                    // Return to the node processessor.
                    this._process_node();
                }
            break;
            case 2:
                var returnvalue;
                var index = 0;
                
                // Create the desired expression.
                switch (this._current_node.returnvalue0.obj)
                {
                    case 'dict': 
                        returnvalue = {};
                        if (this._current_node.index > 0) {
                            for (var i=1;i <= this._current_node.index;i++) {
                                returnvalue[this._current_node['returnvalue' + String(i)][0]] = this._current_node['returnvalue' + String(i)][1];
                            }            
                        }
                    break;       
                    case 'list': 
                        returnvalue = new Array();
                        if (this._current_node.index > 0) {
                            for (var i=1;i <= this._current_node.index;i++) {
                                returnvalue.push(this._current_node['returnvalue' + String(i)]);
                            }
                        }   
                    break;       
                    case 'tuple':
                        returnvalue = new Array();
                        if (this._current_node.index > 0) {
                            for (var i=1;i <= this._current_node.index;i++) {
                                returnvalue.push(this._current_node['returnvalue' + String(i)]);
                            }
                        }   
                    break;
                }  
                
                // Set return value for the parent node.     
                this._set_return_value(this._current_node.parent, returnvalue);
                
                // Reset status of node and return to the parten node to process.
                this._current_node.index = 0;
                this._current_node.status = 0;
                this._current_node = this._current_node.parent;
                this._process_node();
             break;
        }    
    }; 

    parser._node_program = function() {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index;
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.body.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.body[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.body[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } else {
                    // End status.
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
                break;
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // All nodes are processed, set status to finished.
                this._status = 2;

                // Complete the inline item.    
                if (this._inline_script != null) {
                    this._inline_script.complete();
                }
                break;
        }
    };

    parser._node_variable_declaration = function() {
        // Initialize index counter only the fitst time.
        this._current_node.index = (typeof this._current_node.index === 'undefined') ? 0 : this._current_node.index;
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Check if all nodes in script have been processed.
                if (this._current_node.index < this._current_node.declarations.length) {
                    // Set current node to next node in list.
                    this._current_node.index++;
                    this._current_node.declarations[this._current_node.index - 1].parent = this._current_node;
                    this._current_node = this._current_node.declarations[this._current_node.index - 1];

                    // Return to the node processessor.
                    this._process_node();
                } else {
                    // Change the node stats.                                
                    this._current_node.status = 1;

                    // Return to the node processessor.
                    this._process_node();
                }
                break;
            case 1:
                // Change the node stats.                                
                this._current_node.status = 2;

                // Set parent node.
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
                break;
        }
    };

    parser._node_variable_declarator = function() {
        // Initialize status property.
        this._current_node.status = (typeof this._current_node.status === 'undefined') ? 0 : this._current_node.status;

        // Process the current status.
        switch (this._current_node.status) {
            case 0:
                // Process init.
                this._current_node.status = 1;
                this._current_node.init.parent = this._current_node;
                this._current_node = this._current_node.init;

                // Return to the node processessor.
                this._process_node();
                break;
            case 1:
                // process id.
                this._current_node.status = 2;
                this._current_node.id.parent = this._current_node;
                this._current_node = this._current_node.id;

                // Return to the node processessor.
                this._process_node();
                break;
            case 2:
                // Set variable.
                window[this._current_node.returnvalue1] = this._current_node.returnvalue0;

                // Set parent node.
                this._current_node.status = 3;
                this._current_node = this._current_node.parent;

                // Return to the node processessor.
                this._process_node();
                break;
        }
    };

    // Definition of private methods - general node processing.

    parser._process_node = function() {
        console.log('processing node');
        console.log(this._current_node);

        // Select the type of node to process
        switch (this._current_node.type) {
            case 'ArrayExpression':
                this._node_array_expression();
                break;    
            case 'AssignmentExpression':
                this._node_assignment_expression();
                break;    
            case 'BinaryExpression':
                this._node_binary_expression();
                break;
            case 'CallExpression':
                this._node_call_expression();
                break;
            case 'EmptyStatement':
                this._node_empty_statement();
                break;
            case 'ExpressionStatement':
                this._node_expression_statement();
                break;
            case 'Identifier':
                this._node_identifier();
                break;
            case 'Literal':
                this._node_literal();
                break;
            case 'MemberExpression':
                this._node_member_expression();
                break;
            case 'NewExpression':
                this._node_new_expression();
                break;
            case 'Program':
                this._node_program();
                break;
            case 'VariableDeclaration':
                this._node_variable_declaration();
                break;
            case 'VariableDeclarator':
                this._node_variable_declarator();
                break;
        }
    };

    // Definition of private methods - run cycle.

    parser._runstatement = function(node) {
        // Call the expression statement en return the value.       
        return this._node_call_expression(node.expression);
    };

    parser._run = function(inline_script, ast_tree) {
        // Set the inline item. 
        this._inline_script = inline_script;

        // Set the first node and its parent.
        this._current_node = ast_tree;
        this._current_node.parent = null;
        this._status = 1;

        console.log(this._current_node);

        // Process the nodes. 
        osweb.parser._process_node();
    };

    // Bind the parser class to the osweb namespace.
    osweb.parser = parser;
}());
/*
 * Definition of the class prng.
 */

(function() {
    function prng() {
        throw "The class prng cannot be instantiated!";
    };

    // Set the class private properties. 
    prng._previous = 0;
    prng._prng = uheprng();
    prng._seed = '0';

    /*
     * Definition of class methods - run cycle.   
     */

    prng._initialize = function() {
        // Create the random seed. 
        this._prng.initState();
        this._prng.hashString(this._seed);
    };

    /*
     * Definition of class methods.   
     */

    prng._getNext = function() {
        // Get the next random number.
        this._previous = (this._prng(1000000000000000) / 1000000000000000);

        // Return function result.
        return this._previous;
    };

    prng._getPrevious = function() {
        // Return function result.
        return this._previous;
    };

    prng._getSeed = function() {
        // Return the current seed value.
        return this._seed;
    };

    prng._random = function(pMin, pMax) {
        // Calculate the range devider.
        var devider = (1 / ((pMax - pMin) + 1));

        // Get the random number and devide it.
        this._previous = ((this._prng(1000000000000000) / 1000000000000000));

        // Set the devider.
        this._previous = pMin + Math.floor(this._previous / devider);

        // Return function result. 
        return this._previous;
    };

    prng._reset = function() {
        // Set the random seed value to 0. 
        this._seed = '0';

        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(String(this._seed));
    };

    prng._setSeed = function(pSeed) {
        // Set the random seed value. 
        this._seed = String(pSeed);

        // Reset the PRNG range.
        this._prng.initState();
        this._prng.hashString(this._seed);
    };

    // Bind the prng class to the osweb namespace.
    osweb.prng = prng;
}());

(function() {
    // Definition of the class screen - startup screen.
    function screen() {
        throw 'The class screen cannot be instantiated!';
    }

    // Definition of private properties.
    screen._container = null;     // EASELJS: Container which holds the shapes. 
    screen._active    = true;     // If true the introduction screen is shown.
    screen._click     = true;     // If true the experiment is started with a mouse click.

    // Definition of private methods - Introduction screen.

    screen._setupIntroScreen = function() {
        // Set the introscreen elements.
        if (this._active === true) {
            this._introScreen = new createjs.Shape();
            this._introScreen.graphics.beginFill('#000000').drawRect(0, 0, osweb.runner._stage.width, osweb.runner._stage.height);
            this._introLine = new createjs.Shape();
            this._introLine.graphics.beginFill('#AAAAAA').drawRect(200, 155, 400, 1);
            this._introText1 = new createjs.Text('OS', "24px bold Times", "#FF0000");
            this._introText1.x = 200;
            this._introText1.y = 135;
            this._introText2 = new createjs.Text(osweb.constants.MESSAGE_002 + osweb.VERSION_NUMBER, "14px Arial", "#FFFFFF");
            this._introText2.x = 231;
            this._introText2.y = 142;
            this._introText3 = new createjs.Text('', "12px Arial", "#FFFFFF");
            this._introText3.x = 200;
            this._introText3.y = 168;
            osweb.runner._stage.addChild(this._introScreen, this._introLine, this._introText1, this._introText2, this._introText3);
            osweb.runner._stage.update();
        }
    };

    screen._setupClickScreen = function() {
        // Check if the experiment must be clicked to start.
        if (this._click === true) {
            // Update inroscreen.
            this._updateIntroScreen(osweb.constants.MESSAGE_006);

            // Setup the mouse click response handler.
            var clickHandler = function(event) {
                // Remove the handler.
                osweb.runner._canvas.removeEventListener("click", clickHandler);

                // Finalize the introscreen elements.
                this._clearIntroScreen();

                // Start the task.
                osweb.runner._initialize();
            }.bind(this);

            // Set the temporary mouse click.
            osweb.runner._canvas.addEventListener("click", clickHandler, false);
        } else {
            // Finalize the introscreen elements.
            this._clearIntroScreen();

            // Start the runner.
            osweb.runner._initialize();
        }
    };

    screen._clearIntroScreen = function() {
        // Update the introscreen elements.
        if (this._active === true) {
            osweb.runner._stage.removeAllChildren();
            osweb.runner._stage.update();
        }
    };

    screen._updateProgressBar = function(percentage)
    {
        if (this._active === true) {
            // Select the stage.
            switch (percentage)
            {
                case -1: 
                    this._progressBarOuter = new createjs.Shape();
                    this._progressBarOuter.graphics.setStrokeStyle(1).beginStroke("#ffffff").drawRect(200, 200, 400, 20);
                    this._progressBarInner = new createjs.Shape();
                    osweb.runner._stage.addChild(this._progressBarOuter,this._progressBarInner);
                    osweb.runner._stage.update();
                break;
                case 100:
                    osweb.runner._stage.removeChild(this._progressBarOuter,this._progressBarInner);
                    osweb.runner._stage.update();
                break;
                default:
                    this._progressBarInner.graphics.beginFill('#ffffff').drawRect(202, 202, Math.round(percentage * 396), 16);
                    osweb.runner._stage.update();
            }        
        }    
    };

    screen._updateIntroScreen = function(text) {
        // Update the introscreen elements.
        if (this._active === true) {
            this._introText3.text = text;
            osweb.runner._stage.update();
        }
    };

    // Bind the screen class to the osweb namespace.
    osweb.screen = screen;
}());

(function() {
    // Definition of the class session - store user session information. 
    function session() {
        throw 'The class session cannot be instantiated!';
    }

    // Definition of private methods.   

    session._initialize = function() {
        // Update the loader text.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_008);

        // Get the session information.
        this._getSessionInformation();
    };

    session._getSessionInformation = function() {
        // Get the session information from the client system.
        this._date = new Date();
        this._session = {
            'browser': {
                'codename': navigator.appCodeName,
                'name': navigator.appName,
                'version': navigator.appVersion
            },
            'date': {
                'startdate': ('0' + this._date.getDate()).slice(-2) + '-' + ('0' + this._date.getMonth()).slice(-2) + '-' + ('0' + this._date.getFullYear()).slice(-2),
                'starttime': ('0' + this._date.getHours()).slice(-2) + ':' + ('0' + this._date.getMinutes()).slice(-2) + ':' + ('0' + this._date.getSeconds()).slice(-2),
                'startdateUTC': ('0' + this._date.getUTCDate()).slice(-2) + '-' + ('0' + this._date.getUTCMonth()).slice(-2) + '-' + ('0' + this._date.getUTCFullYear()).slice(-2)
            },
            'experiment': {
                'debug': 0,
                'parameters': 0,
                'pilot': 0,
                'taskname': 0,
                'taskversion': 0
            },
            'screen': {
                'availableHeight': screen.availHeight,
                'availableWidth': screen.availWidth,
                'colorDepth': screen.colorDepth,
                'height': screen.height,
                'outerheight': window.outerheight,
                'outerwidth': window.outerwidth,
                'pixelDepth': screen.pixelDepth,
                'screenX': window.screenX,
                'screenY': window.screenY,
                'width': screen.width
            },
            'system': {
                'os': navigator.platform
            }
        };
    };

    // Bind the session class to the osweb namespace.
    osweb.session = session;
}());
(function() {
    // Definition of the class transfer - tranfer information from/to file/server.
    function transfer() {
        throw 'The class transfer cannot be instantiated!';
    }

    // Definition of private properties.
    transfer._counter = null;   // Counter used for processing the pool items.
    transfer._poolfiles = null; // Array containg the pool items.           

    // Definition of private methods - reading osexp files.   

    transfer._readOsexpFile = function(source) {    
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_003);
        osweb.screen._updateProgressBar(-1);
        
        // Check type of object.
        if (source.constructor === File) {
            // Source is a local loaded file, load binary.
            this._readOsexpFromFile(source);
        }    
        else {
            // Check if the source is a script string.
            if (source.substr(0,3) === '---') {
                // Disable the progressbar.    
                osweb.screen._updateProgressBar(100);

                // Set the script paramter.
                osweb.runner._script = source;
                
                // Start buiding the experiment.
                osweb.runner._build();
            }
            else {
                // Server source, check if the url is valid
                this._readOsexpFromServer(source);
            }
        }    
    };

    transfer._readOsexpFromFile = function(file) {
        // Reading and extracting an osexp file from a file location.
        TarGZ.loadLocal(file, 
            function(event) {
                osweb.screen._updateProgressBar(100);
                this._processOsexpFile(event);
            }.bind(this),
            function(event) {
                //osweb.runner._updateIntroScreen('loading experiment: ' + Math.round((event.loaded / event.total) * 100) + '%.');
                osweb.screen._updateProgressBar((event.loaded / event.total) );
            }.bind(this),
            function(event) {
                console.log('error');
            }.bind(this));
    };   

    transfer._readOsexpFromServer = function(url) {
        // Reading and extracting an osexp file from a server location.
        TarGZ.load(url, 
            function(event) {
                osweb.screen._updateProgressBar(100);
                this._processOsexpFile(event);
            }.bind(this),
            function(event) {
                osweb.screen._updateProgressBar((event.loaded / event.total) );
                //osweb.runner._updateIntroScreen('loading experiment: ' + Math.round((event.loaded / event.total) * 100) + '%.');
            }.bind(this),
            function(event) {
                console.log('error');
            }.bind(this));
    };   

    transfer._processOsexpFile = function(files) {
        // Update the intro screen.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_004);
        osweb.screen._updateProgressBar(-1);
      
        // First get the first element, which is the script.
        osweb.runner._script = files[0].data; 
    
        // Remove the script and the folder (pool) items.
        this.counter = 0;
        files.splice(0,2);
        this.poolfiles = files;
    
        // Process the individual pool files.
        this._processOsexpPoolItems();
    }; 

    transfer._processOsexpPoolItems = function() {
        if (this.counter < this.poolfiles.length)
        {
            // Create a file pool element.
            var item = {
                data: null,
                folder: this.poolfiles[this.counter].filename,
                name: this.poolfiles[this.counter].filename.replace(/^.*[\\\/]/, ''),
                size: this.poolfiles[this.counter].length,
                type: 'undefined'
            };    

            var ext = this.poolfiles[this.counter].filename.substr(this.poolfiles[this.counter].filename.lastIndexOf('.') + 1);
            if ((ext == 'jpg') || (ext == 'png')) {
                // Create a new file pool mage item.
                var img = new Image();
                img.src = this.poolfiles[this.counter].toDataURL();
                item.data = img;
                item.type = 'image';
            } else if ((ext == 'wav') || (ext == 'ogg')) {
                var ado = new Audio();
                ado.src = this.poolfiles[this.counter].toDataURL();
                item.data = ado;
                item.type = 'sound';
            } else if (ext == 'ogv') {
                var ado = document.createElement("VIDEO");
                ado.src = this.poolfiles[this.counter].toDataURL();
                item.data = ado;
                item.type = 'video';
            };
        
            // Add the item to the virtual pool.
            osweb.pool._add(item);
            
            // Updfate the progress bar.
            osweb.screen._updateProgressBar(this.counter / this.poolfiles.length);
            
            // Update the counter.
            this.counter++;

            // Time out caller to prevent blocking.
            setTimeout(function(){ this._processOsexpPoolItems(); }.bind(this), 10);
        }    
        else
        {
            // All files have been process, start the experiment process.
            osweb.screen._updateProgressBar(100);

            // Continue the experiment build.
            osweb.runner._build();
        }    
    };

    // Definition of private methods - writing data files.   

    transfer._writeDataFile = function(target, resultData) {
        // Check if the target and resultData are defined.
        if ((target != null) && (resultData !== null))
        {
            // Add the data as a form element.
            var data = new FormData();
            data.append("data" , resultData.toString());
            // Create the request.
            var xhr = new XMLHttpRequest(); 
            xhr.open('post', target + '?file=subject-' + osweb.runner.experiment.vars['subject_nr'], true);

            // Send the actual data.
            xhr.send(data);
        }    
    };    
    
    // Bind the transfer class to the osweb namespace.
    osweb.transfer = transfer;
}());

(function() {
    // Definition of the class runner - core module to run an Osexp experiment.
    function runner() {
        throw 'The class runner cannot be instantiated!';
    };

    // Definition of private properties.
    runner._canvas = null; // Canvas on which the experiment is shown.
    runner._onfinished = null; // Event triggered on finishing the experiment.
    runner._script = null; // Container for the script definition of the experiment.
    runner._source = null; // Link to the source experiment file. 
    runner._stage = null; // Link to the stage object (EASELJS).
    runner._target = null; // Link to the target location for thr data. 
    
    // Definition of public properties.
    runner.data = null; // Container for the result data.
    runner.debug = false; // Debug toggle.
    runner.experiment = null; // The root experiment object to run.           
    runner.status = osweb.constants.RUNNER_NONE; // Status of the runner.
    
    // Definition of private methods - setup runner.      

    runner._setupContent = function(content) {
        // Check if the experiment container is defined.                     
        if (typeof content !== "undefined") {
            // Get the canvas from the DOM element tree.
            this._canvas = (typeof content === 'string') ? document.getElementById(content) : content;

            // Set the stage object (easelJS). 
            this._stage = new createjs.Stage(this._canvas);
            this._stage.snapToPixelEnabled = true;
            this._stage.regX = -.5;
            this._stage.regY = -.5;

        } else {
            osweb.debug.addError(osweb.constants.ERROR_002);
        }
    };

    runner._setupContext = function(context) {
        // Check if the script parameter is defined.                        
        if (typeof context !== "undefined") {
            // Initialize the context parameters.
            this.debug = (typeof context.debug !== 'undefined') ? context.debug : false;
            this._onfinished = (typeof context.onfinished !== 'undefined') ? context.onfinished : null;
            this._source = (typeof context.source !== 'undefined') ? context.source : null;
            this._target = (typeof context.target !== 'undefined') ? context.target : null;
            
            // Build the introduction screen.
            osweb.screen._active = (typeof context.introscreen !== 'undefined') ? context.introscreen : true;
            osweb.screen._click = (typeof context.introclick !== 'undefined') ? context.introclick : true;
            osweb.screen._setupIntroScreen();

            // Load the script file, using the source parameter.
            osweb.transfer._readOsexpFile(this._source);
        } 
        else {
            osweb.debug.addError(osweb.constants.ERROR_003);
        }
    };

    // Definition of the private methods - build cycle.      

    runner._build = function() {
        // Set status of the runner.
        this.status = osweb.constants.RUNNER_READY;
        
        // Build the base experiment object.
        this.experiment = new osweb.experiment(null, 'test', this._script);

        // Build the global static object classes.
        window['items'] = osweb.item_store;
        window['pool'] = osweb.file_pole_store;
        window['vars'] = this.experiment.vars;

        // Pepare the experiment to run.
        this._prepare();
    };

    // Definition of private methods - prepare cycle.   

    runner._prepare = function() {
        // Update inroscreen.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_005);

        // Initialize the helper classes.
        osweb.functions._initialize();
        osweb.python_workspace_api._initialize();
        osweb.session._initialize();
        osweb.parameters._initialize();
    };

    // Definition of private methods - run cycle.   

    runner._initialize = function() {
        // Initialize the debugger. 
        osweb.debug._initialize();

        // Initialize the event system.
        osweb.events._initialize();

        // Set status of the runner.
        this.status = osweb.constants.RUNNER_RUNNING;

        // Prepare and execute the experiment item.
        this.experiment.prepare();
        this.experiment.run();
    };

    runner._finalize = function() {
        // Finalize the event system.
        osweb.events._finalize();

        // Finalize the debugger.
        osweb.debug._finalize();

        // Exit the runner.          
        this._exit();
    };

    runner._exit = function() {
        // Clear the canvas.
        this._stage.clear();

        // Set the cursor visibility to default (visible).
        this._stage.canvas.style.cursor = "default";

        // Write result data to target location (if defined).
        osweb.transfer._writeDataFile(this._target, this.data);

        // Check if a callback function is defined. 
        if (this._onfinished) {
            // Execute callback function.
            this._onfinished(this.data, osweb.session._session);
        }
    };

    // Definition of public methods - run cycle.      

    runner.exit = function() {
        // Set status of the runner.
        this.status = osweb.constants.RUNNER_BREAK;
        
        // Set break flag in the events class.
        osweb.events._break = true;
    };

    runner.run = function(content, context) {
        // Initialize the content container.
        this._setupContent(content);

        // Initialize the context parameter
        this._setupContext(context);
    };

    // Bind the runner class to the osweb namespace.
    osweb.runner = runner;
}());