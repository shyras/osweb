import BaseElement from './base_element.js';

/**
 * Class representing an arrow element.
 * @extends BaseElement
 */
export default class Noise extends BaseElement {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
		var defaults = {};
        defaults.color1 = 'white';
        defaults.color2 = 'black';
        defaults.env = 'gaussian';
        defaults.size = 96;
        defaults.stdev = 12;
        defaults.x = null;
        defaults.y = null;
        defaults.bgmode = 'avg';

        // Inherited.
        super(sketchpad, script, defaults);
	}

 	/** Implements the draw phase of an element. */
   	draw() {
	    // Inherited.	
        super.draw();

	    // Draw the noise element to the canvas of the sketchpad.
        this.sketchpad.canvas.noise( this._properties.x, this._properties.y, 
            this._properties.env, this._properties.size, this._properties.stdev, 
            this._properties.color1, this._properties.color2, this._properties.bgmode );
    }
}
