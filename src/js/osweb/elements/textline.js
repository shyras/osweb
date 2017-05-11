import BaseElement from './base_element.js';
import Styles from '../backends/styles.js';

/**
 * Class representing a textline element.
 * @extends BaseElement
 */
export default class Textline extends BaseElement {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
        var defaults = {};
        defaults.center = 1;
        defaults.color = sketchpad.vars.get('foreground');
        defaults.font_family = sketchpad.vars.get('font_family');
        defaults.font_size = sketchpad.vars.get('font_size');
        defaults.font_bold = sketchpad.vars.get('font_bold');
        defaults.font_italic = sketchpad.vars.get('font_italic');
        defaults.html = 'yes';
        defaults.text = null;
        defaults.x = null;
        defaults.y = null;

        // Inherited.
        super(sketchpad, script, defaults);
    }

    /** Implements the draw phase of an element. */
    draw() {
        // Inherited.	
        super.draw();

        // Decode text so unicode is converted properly. 
        var text = decodeURIComponent(escape(this._properties.text));

        // Create a styles object containing style information
        var styles = new Styles();
        styles.color = this._properties.color;
        styles.font_family = this._properties.font_family;
        styles.font_size = this._properties.font_size;
        styles.font_italic = (this._properties.font_italic === 'yes');
        styles.font_bold = (this._properties.font_bold === 'yes');
        styles.font_underline = (this._properties.font_underline === 'yes');

        this.sketchpad.canvas.text(text, this._properties.center, 
            this._properties.x, this._properties.y, this._properties.html, 
            styles);
    }
}
 