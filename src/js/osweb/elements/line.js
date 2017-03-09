/**
 * Class representing an arrow element.
 * @extends BaseElement
 */
osweb.line = class Line extends osweb.base_element {
    /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} sketchpad - The sketchpad item that owns the visual element.
     * @param {String} script - The script containing properties of the visual element.
     */
    constructor(sketchpad, script) {
        // Create a default property container.
		var defaults = {};
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
		var styles = new osweb.styles();
		styles.color = this._properties.color;
		styles.penwidth = this._properties.penwidth;

		// Draw the line element to the canvas of the sketchpad.
		this.sketchpad.canvas.line(this._properties.x1, this._properties.y1, 
			this._properties.x2, this._properties.y2, styles);
	}
}
 