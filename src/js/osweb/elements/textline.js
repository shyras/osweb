/*
 * Definition of the class textline.
 */

module.exports = function(osweb){
    "use strict";
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
        var styles = new osweb.Styles();
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
    return osweb.promoteClass(textline, "base_element");
}