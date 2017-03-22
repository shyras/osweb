/** Class representing an OpenSesame Widget. */
export default class Widget {
    /**
     * Create a widget object which is the base class for all widgets.
     * @param {Object} form - The form  which the widget belongs.
     */
    constructor(form) {
        // Set the class private properties.
        this._panel = new zebra.ui.Panel({
            background : form.experiment.vars.background,
            height: 100, 
            width: 100,  
            x: 0,
            y: 0  
        });    

        // Set the class public properties.
        this.focus = false;
        this.form = form;
        this.rect = null;
        this.type = 'widget';
        this.vars = null;

        // Add the panel to the form panel.
        form._panel.add(this._panel);
    }    

    /**
     * Convert html value types (number, px of % to number);
     * @param {Number|String} value - The value to convert
     * @return {Number} - The converted value.
     */
    convert_value(value) {
        // Convert html value types (number, px of % to number);
        if (typeof value === 'number') {
            return value;
        } else {
            if (value.indexOf('px') !== -1) {
                return value.slice(0, value.indexOf('px'));
            } else if (value.indexOf('%') !== -1) {
                return value.slice(0, value.indexOf('%'));
            } else {
                return Number(value);
            }    
        }
    }

    /**
     * Draw a frame around the widget.    
     * @param {Number|String} rect - The coordinates of the frame (ignored).
     * @param {Number|String} style - The style to use (ignored).
     */
    draw_frame(rect, style) {
        /* this._element.style.backgroundColor = this.form._themes.theme[this.form.theme].backgroundColor;
        this._element.style.borderColor = this.form._themes.theme[this.form.theme].lineColorLeftTop + ' ' + 
                                          this.form._themes.theme[this.form.theme].lineColorRightBottom + ' ' + 
                                          this.form._themes.theme[this.form.theme].lineColorRightBottom + ' ' +
                                          this.form._themes.theme[this.form.theme].lineColorLeftTop; 
        this._element.style.borderWidth = "1px";
        this._element.style.borderStyle = "solid"; */
    }

    /**
     * Sets an experimental variable.
     * @param {Boolean|Number|String} value - The value for the variable.
     * @param {String} variable - The name of the variabler to set.
     */
    set_var(value, variable) {
        // Sets an experimental variable.
        if (variable === null) {
            variable = this.vars;
        }

        if (variable !== null) {
            this.form.experiment.vars.set(variable, value);
        }
    }
}
 