import BaseElement from './base_element.js';
import Styles from '../backends/styles.js';

/**
 * Class representing an arrow element.
 * @extends BaseElement
 */
export default class Arrow extends BaseElement {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
		var defaults = {};
		defaults.arrow_body_length = 0.8;
		defaults.arrow_body_width = 0.5;
		defaults.arrow_head_width = 30;
		defaults.fill = 1;
		defaults.color = sketchpad.vars.get('foreground');
		defaults.penwidth = 1;
		defaults.x1 = null;
		defaults.y1 = null;
		defaults.x2 = null;
		defaults.y2 = null;

        // Inherited.
        super(sketchpad, script, defaults);
	}
 
 	/** Implements the draw phase of an element. */
   	draw() {
	    // Inherited.	
        super.draw();

		// Create a styles object containing style information
		var styles = new Styles();
		styles.background_color = this._properties.color;
		styles.color = this._properties.color;
		styles.fill = this._properties.fill;
		styles.penwidth = this._properties.penwidth;

		// Draw the arrow element to the canvas of the sketchpad.
		this.sketchpad.canvas.arrow(this._properties.x1, this._properties.y1, 
			this._properties.x2, this._properties.y2, this._properties.arrow_body_width, 
			this._properties.arrow_body_length, this._properties.arrow_head_width, 
			styles);
	}
}
