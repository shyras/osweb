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
module.exports = Styles;