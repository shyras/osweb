"use strict";
/** Definition of the class Style.

Style is a simple class that holds information about the style with which
a stimulus is to be drawn. One simply uses style by storing the desired
style information in it. For instance, to store a color and a penwidth
one should simply do

    style = new Styles()
    style.color = "#F00"
    style.penwidth = 3

*/
       
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
 * 
 */
p.convertColorValue = function(color) {
    // Method to convert color names and hex values to rgb object (used in gabor and noise).
    var colours = {"aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4",
                   "azure": "#f0ffff", "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", 
                   "blanchedalmond": "#ffebcd", "blue": "#0000ff",
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
        "grey": "#808080",
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
        "yellowgreen": "#9acd32"};
    if (typeof(color) === 'undefined') {
        return 0     
    } else if (this.isInt(color) === true) {
        // Doe not work yet (##! uitzoeken)
        return color
    } else if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color) === true) {  
        // Value is a valid hex number, convert it.
        var color = color.slice(1);
        if (color.length === 3) {
            // Expand the color to 6 characters.
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        
        var value = '0x' + color;
        while (value.length < 8) {
            value = value + '0';
        }
        // Return hex conversion
        return parseInt(value);        
    } else if (color.slice(0,3).toLowerCase() === 'rgb') {
        // Value is a rgb string number, convert it.
        var a = color.split("(")[1].split(")")[0];
        a = a.split(",");
        var b = a.map(function(x){                      
            //For each array element
            if (/^\d+(\.\d+)?%$/.test(x)) {
                // pass
                x = x.slice(0, -1);
                x = (parseInt(x) / 100) * 256;
                x = x.toString(16); 
            } else {
                // fail
                x = parseInt(x).toString(16);      //Convert to a base16 string
            }
            return (x.length==1) ? "0"+x : x; //Add zero if we get only one character
        });

        b = "0x"+b.join("");
        return b;
    } else if (typeof colours[color.toLowerCase()] !== 'undefined') {
        // Value is a constant color name, convert it.
        var colour = colours[color.toLowerCase()];
        var value = '0x' + colour.slice(1)        
        // Return hex conversion
        return parseInt(value);        
    }
    else {
        // value is a string number, convert it.
        return parseInt(color);
    }  
}

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
        // Convert the color to a valid numeric value. 
        this._color = this.convertColorValue(val) 
    }
});

Object.defineProperty(p, "background_color", {
    get: function(){ return this._background_color },
    set: function(val){
        // Convert the color to a valid numeric value. 
        this._background_color = this.convertColorValue(val) 
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
module.exports = Styles;