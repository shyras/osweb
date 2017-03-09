/**
 * Class representing a Sketchpad item. 
 * @extends GeneralResponse
 */
osweb.sketchpad = class Sketchpad extends osweb.generic_response {
    /** The sequence class controls the running of a serie of items. */
    constructor(experiment, name, script) {
        // Inherited.
        super(experiment, name, script)     

        // Create and set private properties. 
        this.canvas = new osweb.canvas(experiment, false);
        this.elements = [];
    
        // Process the script.
        this.from_string(script);
   }    

    /**
     * Sort function used for determining the draw index (z-index) of alle elemente.
     * @param {Object} a - The first object to compare.
     * @param {Object} b - The second object to compare.
     * @return {Number} - The result of the comparison.
     */
    _compare(a, b) {
        // Sort function used for determining the draw index (z-index) of alle elemente.
        if (a.z_index() < b.z_index())
            return 1;
        else if (a.z_index() > b.z_index())
            return -1;
        else
            return 0;
    }

    /** Implements the complete phase of the Sketchpad item. */
    _complete() {
        // Clear the canvas.
        this.canvas.clear();

        // Inherited.	
        super._complete();
    }

    /** Resets all item variables to their default value. */
    reset() {
        // Resets all item variables to their default value.
        this.elements = [];
        this.vars.duration = 'keypress';
    }

    /**
     * Parse a definition string and retrieve all properties of the item.
     * @param {String} script - The script containing the properties of the item.
     */
     from_string(script) {
        // Define and reset variables to their defaults.
        this.variables = {};
        this.comments = [];
        this.reset();

        // Split the string into an array of lines.  
        if (script !== null) {
            var lines = script.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)) {
                    var tokens = this.syntax.split(lines[i]);
                    if ((tokens.length > 0) && (tokens[0] === 'draw')) {
                        if (this.experiment.items._isClass(tokens[1]) === true) {
                            var element = this.experiment.items._newElementClass(tokens[1], this, lines[i]);
                            this.elements.push(element);
                        } else {
                             this.experiment._runner._debugger.addError('Failed to parse definition: ' + tokens[1]);
                        }
                    }
                }
            }

            // Sort the elements usin the z-index.
            this.elements.sort(this._compare);
        }
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Draw the elements. 
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].is_shown() === true) {
                this.elements[i].draw();
            }
        }

        // Inherited.	
        super.prepare();
    }

    /** Implements the run phase of the Sketschpad. */
    run() {
        // Inherited.	
        super.run();

        // Check if background color needs to be changed
        var background_color = this.vars.get('background');
        if (background_color) {
            this.canvas._styles.backgroundColor = background_color;
        } 

        // Set the onset and start the stimulus response process.  
        this.set_item_onset(this.canvas.show());
        this.set_sri(false);
        this.process_response();
    }
}
  