import BaseElement from './base_element.js';
import Styles from '../backends/styles.js';

/**
 * Class representing an arrow element.
 * @extends BaseElement
 */
export default class Circle extends BaseElement {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
		var defaults = {};
		defaults.color = sketchpad.vars.get('foreground');
		defaults.fill = 0;
		defaults.penwidth = 1;
		defaults.x = null;
		defaults.y = null;
		defaults.r = null;

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

		// Draw the circle element to the canvas of the sketchpad.
		this.sketchpad.canvas.circle(this._properties.x, this._properties.y, 
			this._properties.r, styles);
	}
}
