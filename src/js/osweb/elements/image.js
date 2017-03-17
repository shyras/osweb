import BaseElement from './base_element.js';

/**
 * Class representing an image element.
 * @extends BaseElement
 */
export default class ImageElement extends BaseElement{
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
   		var defaults = {};
		defaults.center = 1;
		defaults.file = null;
		defaults.scale = 1;
		defaults.x = null;
		defaults.y = null;

		// Inherited.
		super(sketchpad, script, defaults);

		// Set the class private properties. 
		this._file = null;
	}

    /** Implements the draw phase of an element. */
	draw() {
		// Inherited.	
		super.draw();

		// Draw the image element to the canvas of the sketchpad.
		this.sketchpad.canvas.image(this._properties.file, this._properties.center, 
			this._properties.x, this._properties.y, this._properties.scale);
	}
}
 