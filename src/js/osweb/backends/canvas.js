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
        return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
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

            console.log("Measuring text size");

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