/**
 * Class representing a reset feedback item.
 * @extends Item
 */
osweb.reset_feedback = class ResetFeedback extends osweb.item {
    /**
     * Create a reset feedback  item which resets the feedback values.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script);

        // Define and set the public properties. 
        this.description = 'Resets the feedback variables, such as "avg_rt" and "acc"';
    
        // Read the item definition string.	
        this.from_string(script);
    }   

    /** Implements the complete phase of an item. */
    _complete() {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        super._complete();
    }
    
    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Run item only one time.   
        if (this._status !== osweb.constants.STATUS_FINALIZE) {
            // Run the item.
            this.experiment.reset_feedback();

            // Complete the current cycle.
            this._complete();
        }
    }
}
