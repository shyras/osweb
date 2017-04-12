import Item from '../items/item.js';
import { constants } from '../system/constants.js';

/**
 * Class representing a notepad item.
 * @extends Item
 */
export default class Notepad extends Item {
    /**
     * Create a notepad plugin item which only shows some text in the console.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script);
    
        // Define and set the public properties. 
        this.description = 'A simple notepad to document your experiment. This plug-in does nothing.';
        
        // Read the item definition string.	
        this.from_string(script);
    }   

    /** Implements the complete phase of an item. */
    _complete() {
        // sequence is finalized.
        this._status = constants.STATUS_FINALIZE;

        // Inherited.	
        super._complete();
    }
    
    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Complete the current cycle.
        this._complete();
    }
}
 