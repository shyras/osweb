/** Class representing a style container. */
export default class Styles {
    /** Styles is a simple class that holds information about the style. */
    constructor(item) {
		
		this._initConstants();
        // Set class private properties.
		if (typeof(item) === 'undefined') {
	        this._background_color = 0x000000;
	        this._bidi = false;
	        this._color = 'white';
	        this._fill = false;
	        this._font_bold = false;
	        this._font_family = 'Arial';
	        this._font_italic = false;
	        this._font_size = 24;
	        this._font_underline = false;
	        this._html = false;
	        this._penwidth = 1;
		} else {
			this.background_color = item.vars.get('background', 0x000000);
	        this.bidi = item.vars.get('bidi', 'no');
	        this.color = item.vars.get('foreground', 'white');
	        this.fill = item.vars.get('fill', 'no') == 'yes';
	        this.font_bold = item.vars.get('font_bold', 'no');
	        this.font_family = item.vars.get('font_family', 'Arial');
	        this.font_italic = item.vars.get('font_italic', 'no');
	        this.font_size = item.vars.get('font_size', 24);
	        this.font_underline = item.vars.get('font_underline', 'no');
	        this.html = item.vars.get('html', 'no');
	        this.penwidth = item.vars.get('penwidth', 1);
		}
    }

    /**
     * Converts a color value (string, number of rgb to a numeric value for use in PIXI.
     * @param {String|Number|Object} color - The color to convert.
     * @return {Number} - The color value.
     */

    _convertColorValue(color) {
        var converted_color = 0;
        // Check if the color definition is a number or a string value.
        if (typeof(color) === 'string') {
            // Check if the string is a hex string.
            if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color) === true) {
                // Check if hex string is 3 of 6 character based. 
                if (color.length === 4) {
                    // Expand the color to 6 characters.
                    converted_color = parseInt('0x' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16);
                } else {
                    converted_color = parseInt('0x' + color[1] + color[2] + color[3] + color[4] + color[5] + color[6], 16);
                }
            } else if (typeof this._DEFAULT_COLOURS[color.toLowerCase()] !== 'undefined') {
                // Value is a constant color name, convert it.
                converted_color = parseInt(this._DEFAULT_COLOURS[color.toLowerCase()], 16);
            } else if (color.slice(0, 3).toLowerCase() === 'rgb') {
                // Value is a rgb string number, convert it.
                var a = color.split('(')[1].split(')')[0];
                a = a.split(',');
                var b = a.map(function(x) {
                    //For each array element
                    if (/^\d+(\.\d+)?%$/.test(x)) {
                        // pass
                        x = x.slice(0, -1);
                        x = Math.round((parseInt(x) / 100) * 255);
                        x = x.toString(16);
                    } else {
                        // fail
                        x = parseInt(x).toString(16); // Convert to a base16 string
                    }
                    return (x.length == 1) ? '0' + x : x; // Add zero if we get only one character
                });
                converted_color = parseInt('0x' + b.join(''));
            }
        } else if (this._isInt(color) === true) {
            if (color < 256) {
                // Luminant value, so convert it to gray scale.
                converted_color = (256 * 256 * color) + (256 * color) + color;
            } else {
                // Luminant values above 255 are not supported, return white.
                converted_color = 16843008;
            }
        }
        // Return the converted color as nubmer value.
        return converted_color;
    }

    _convertColorValueToRGB(color) {
        // Convert the color to numeric values. 
        var converted_color = this._convertColorValue(color);
        // Convert colors to rgb format.
        return {
            r: converted_color >> 16,
            g: converted_color >> 8 & 0xFF,
            b: converted_color & 0xFF
        }
    }

    /**
     * Checks if the passed value is an integer.
     * @param {Number} value -  The value to check.
     * @return {Boolean} - True if passed value is an integer.
     */
    _isInt(value) {
        var x;
        return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
    }

    /**
     * Checks if value is possibly specified as 'yes'/'no' or 1/0 instead of
     * true or false (as is done in OS script). Convert 'yes' and 'no' values
     * to booleans
     * @param {Number|String} value - The value to check.
     * @return {Boolean} - The original boolean, or true if value was 'yes'. 
     */
    _checkVal(value) {
        return [true, 'yes', 1, '1'].indexOf(value) != -1;
    }

    /**
     * Get the background_color value.
     * @return {String} The background_color value.
     */
    get background_color() {
        return this._background_color;
    }

    /**
     * Set the background_color value.
     * @param {Number|String} val - The background_color value to set.
     */
    set background_color(val) {
        this._background_color = this._convertColorValue(val, 'number');
    }

    /**
     * Get the bidi value.
     * @return {Boolean} The bidi value.
     */
    get bidi() {
        return this._bidi;
    }

    /**
     * Set the bidi value.
     * @param {Boolean} val - The bidi value to set.
     */
    set bidi(val) {
        this._bidi = this._checkVal(val)
    }

    /**
     * Get the color value.
     * @return {String} The color value.
     */
    get color() {
        return this._color;
    }

    /**
     * Set the color value.
     * @param {Number|String} val - The color value to set.
     */
    set color(val) {
        this._color = this._convertColorValue(val, 'number');
    }

    /**
     * Get the fill value.
     * @return {Boolean} The fill value.
     */
    get fill() {
        return this._fill;
    }

    /**
     * Set the fill value.
     * @param {Boolean} val - The fill value to set.
     */
    set fill(val) {
        this._fill = ([1, '1', true, 'yes'].indexOf(val) !== -1) ? true : false;
    }

    /**
     * Get the font_bold value.
     * @return {Boolean} The font_bold value.
     */
    get font_bold() {
        return this._font_bold;
    }

    /**
     * Set the font_bold value.
     * @param {Boolean} val - The font_bold value to set.
     */
    set font_bold(val) {
        this._font_bold = this._checkVal(val);
    }

    /**
     * Get the font_family value.
     * @return {String} The font_family value.
     */
    get font_family() {
        return this._font_family;
    }

    /**
     * Set the font_family value.
     * @param {String} val - The font_family value to set.
     */
    set font_family(val) {
        if (val in this._DEFAULT_FONTS) {
            this._font_family = this._DEFAULT_FONTS[val];
        } else {
            this._font_family = val;
        }
    }

    /**
     * Get the font_italic value.
     * @return {Boolean} The font_italic value.
     */
    get font_italic() {
        return this._font_italic;
    }

    /**
     * Set the font_italic value.
     * @param {Boolean} val - The font_bold value to set.
     */
    set font_italic(val) {
        this._font_italic = this._checkVal(val);
    }

    /**
     * Get the font_size value.
     * @return {Number} The font_size value.
     */
    get font_size() {
        return this._font_size;
    }

    /**
     * Set the font_size value.
     * @param {Number} val - The font_size value to set.
     */
    set font_size(val) {
        if (!this._isInt(val)) {
            // remove px part
            this._font_size = Number(val.slice(0, -2));
        } else {
            this._font_size = val;
        }
    }

    /**
     * Get the font_underline value.
     * @return {Boolean} The font_underline value.
     */
    get font_underline() {
        return this._font_underline;
    }

    /**
     * Set the font_underline value.
     * @param {Boolean} val - The font_underline value to set.
     */
    set font_underline(val) {
        this._font_underline = this._checkVal(val);
    }

    /**
     * Get the html value.
     * @return {Boolean} The html value.
     */
    get html() {
        return this._html;
    }

    /**
     * Set the html value.
     * @param {Boolean} val - The html value to set.
     */
    set html(val) {
        this._html = this._checkVal(val);
    }

    /**
     * Get the penwidth value.
     * @return {Boolean} The penwidth value.
     */
    get penwidth() {
        return this._penwidth;
    }

    /**
     * Set the penwidth value.
     * @param {Boolean} val - The penwidth value to set.
     */
    set penwidth(val) {
        if (!this._isInt(val)) {
            this._penwidth = 1;
        }
        this._penwidth = val;
    }
	
	_initConstants() {
		// Set constant default colors.
		this._DEFAULT_COLOURS = {
			'aliceblue': '0xf0f8ff',
			'antiquewhite': '0xfaebd7',
			'aqua': '0x00ffff',
			'aquamarine': '0x7fffd4',
			'azure': '0xf0ffff',
			'beige': '0xf5f5dc',
			'bisque': '0xffe4c4',
			'black': '0x000000',
			'blanchedalmond': '0xffebcd',
			'blue': '0x0000ff',
			'blueviolet': '0x8a2be2',
			'brown': '0xa52a2a',
			'burlywood': '0xdeb887',
			'cadetblue': '0x5f9ea0',
			'chartreuse': '0x7fff00',
			'chocolate': '0xd2691e',
			'coral': '0xff7f50',
			'cornflowerblue': '0x6495ed',
			'cornsilk': '0xfff8dc',
			'crimson': '0xdc143c',
			'cyan': '0x00ffff',
			'darkblue': '0x00008b',
			'darkcyan': '0x008b8b',
			'darkgoldenrod': '0xb8860b',
			'darkgray': '0xa9a9a9',
			'darkgreen': '0x006400',
			'darkgrey': '0xa9a9a9',
			'darkkhaki': '0xbdb76b',
			'darkmagenta': '0x8b008b',
			'darkolivegreen': '0x556b2f',
			'darkorange': '0xff8c00',
			'darkorchid': '0x9932cc',
			'darkred': '0x8b0000',
			'darksalmon': '0xe9967a',
			'darkseagreen': '0x8fbc8f',
			'darkslateblue': '0x483d8b',
			'darkslategray': '0x2f4f4f',
			'darkslategrey': '0x2f4f4f',
			'darkturquoise': '0x00ced1',
			'darkviolet': '0x9400d3',
			'deeppink': '0xff1493',
			'deepskyblue': '0x00bfff',
			'dimgray': '0x696969',
			'dimgrey': '0x696969',
			'dodgerblue': '0x1e90ff',
			'firebrick': '0xb22222',
			'floralwhite': '0xfffaf0',
			'forestgreen': '0x228b22',
			'fuchsia': '0xff00ff',
			'gainsboro': '0xdcdcdc',
			'ghostwhite': '0xf8f8ff',
			'gold': '0xffd700',
			'goldenrod': '0xdaa520',
			'gray': '0x808080',
			'grey': '0x808080',
			'green': '0x008000',
			'greenyellow': '0xadff2f',
			'honeydew': '0xf0fff0',
			'hotpink': '0xff69b4',
			'indianred ': '0xcd5c5c',
			'indigo': '0x4b0082',
			'ivory': '0xfffff0',
			'khaki': '0xf0e68c',
			'lavender': '0xe6e6fa',
			'lavenderblush': '0xfff0f5',
			'lawngreen': '0x7cfc00',
			'lemonchiffon': '0xfffacd',
			'lightblue': '0xadd8e6',
			'lightcoral': '0xf08080',
			'lightcyan': '0xe0ffff',
			'lightgoldenrodyellow': '0xfafad2',
			'lightgray': '0xd3d3d3',
			'lightgrey': '0xd3d3d3',
			'lightgreen': '0x90ee90',
			'lightpink': '0xffb6c1',
			'lightsalmon': '0xffa07a',
			'lightseagreen': '0x20b2aa',
			'lightskyblue': '0x87cefa',
			'lightslategray': '0x778899',
			'lightslategrey': '0x778899',
			'lightsteelblue': '0xb0c4de',
			'lightyellow': '0xffffe0',
			'lime': '0x00ff00',
			'limegreen': '0x32cd32',
			'linen': '0xfaf0e6',
			'magenta': '0xff00ff',
			'maroon': '0x800000',
			'mediumaquamarine': '0x66cdaa',
			'mediumblue': '0x0000cd',
			'mediumorchid': '0xba55d3',
			'mediumpurple': '0x9370d8',
			'mediumseagreen': '0x3cb371',
			'mediumslateblue': '0x7b68ee',
			'mediumspringgreen': '0x00fa9a',
			'mediumturquoise': '0x48d1cc',
			'mediumvioletred': '0xc71585',
			'midnightblue': '0x191970',
			'mintcream': '0xf5fffa',
			'mistyrose': '0xffe4e1',
			'moccasin': '0xffe4b5',
			'navajowhite': '0xffdead',
			'navy': '0x000080',
			'oldlace': '0xfdf5e6',
			'olive': '0x808000',
			'olivedrab': '0x6b8e23',
			'orange': '0xffa500',
			'orangered': '0xff4500',
			'orchid': '0xda70d6',
			'palegoldenrod': '0xeee8aa',
			'palegreen': '0x98fb98',
			'paleturquoise': '0xafeeee',
			'palevioletred': '0xd87093',
			'papayawhip': '0xffefd5',
			'peachpuff': '0xffdab9',
			'peru': '0xcd853f',
			'pink': '0xffc0cb',
			'plum': '0xdda0dd',
			'powderblue': '0xb0e0e6',
			'purple': '0x800080',
			'red': '0xff0000',
			'rosybrown': '0xbc8f8f',
			'royalblue': '0x4169e1',
			'saddlebrown': '0x8b4513',
			'salmon': '0xfa8072',
			'sandybrown': '0xf4a460',
			'seagreen': '0x2e8b57',
			'seashell': '0xfff5ee',
			'sienna': '0xa0522d',
			'silver': '0xc0c0c0',
			'skyblue': '0x87ceeb',
			'slateblue': '0x6a5acd',
			'slategray': '0x708090',
			'slategrey': '0x708090',
			'snow': '0xfffafa',
			'springgreen': '0x00ff7f',
			'steelblue': '0x4682b4',
			'tan': '0xd2b48c',
			'teal': '0x008080',
			'thistle': '0xd8bfd8',
			'tomato': '0xff6347',
			'turquoise': '0x40e0d0',
			'violet': '0xee82ee',
			'wheat': '0xf5deb3',
			'white': '0xffffff',
			'whitesmoke': '0xf5f5f5',
			'yellow': '0xffff00',
			'yellowgreen': '0x9acd32'
		};

		// Set constant default fonts.
		this._DEFAULT_FONTS = {
			'sans': 'Droid Sans',
			'serif': 'Droid Serif',
			'mono': 'Droid Sans Mono',
			'chinese-japanese-korean': 'WenQuanYi Micro Hei',
			'arabic': 'Droid Arabic Naskh',
			'hebrew': 'Droid Sans Hebrew',
			'hindi': 'Lohit Hindi'
		};
	};
}
 
