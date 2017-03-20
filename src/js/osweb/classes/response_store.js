/** Class representing a ResponseStore object*/
export default class ResponseStore {
    /**
     * Create an object which stores information about one single response.
     * @param {Object} experiment - The experiment to which the store belongd.
     */
    constructor(experiment) {
        // Create and set private properties. 
        this._experiment = experiment;
		this._feedback_from = 0;
		this._responses = [];
    }    

    /**
     * Select items from the store which match the selected property.
     * @param {Object} kwdict - The property and value to check.
     */
    _select(kwdict) {
    }

    /**
     * Select items from the store which not match the selected property.
     * @param {Object} kwdict - The property and value to check.
     */
    _selectnot(kwdict) {
    }

    /**
     * Get the property acc.
     * @return {Number} - The precentage correct responses included in feedback.
     */
    get acc() { 
        return 0; 
    }

    /**
     * Get the property afg_rt.
     * @return {Number} - The acerage response time included in feedback.
     */
    get avg_rt() { 
        return 0; 
    }

    /**
     * Get the property correct.
     * @return {Array} - A list of all correct responses.
     */
    get correct() { 
        return null; 
    }

    /**
     * Get the property feedback.
     * @return {Array} - A list of all feedback status.
     */
    get feedback() { 
        return null; 
    }

    /**
     * Get the property item.
     * @return {Array} - A list of all item names.
     */
    get item() { 
        return null; 
    }

    /**
     * Get the property response.
     * @return {Array} - A list of all responses.
     */
    get response() { 
        return null; 
    }

    /**
     * Get the property response_time.
     * @return {Array} - A list of all response time.
     */
    get response_time() { 
        return null; 
    }

    /**
     * Get the property var.
     * @return {Object} - the var store of the parent experment item.
     */
    get var() { 
        return this._experiment.var; 
    }

    /**
     * Add an object which stores information about one single response.
     * @param {String} response - The response chracter itself.
     * @param {Boolean|Number} correct - Correct of incorrect response.
     * @param {Number} responseTime - Correct of incorrect response.
     * @param {Object} item - The item to which the response belongs.
     * @param {Boolean} feedback - If true the reponse is evaluated for feedback.
     */
    add(response, correct, responseTime, item, feedback) {
        // Create a response_info object.
        var responnse = new ResponseInfo(this, response, correct, responseTime, item, feedback);

        // Add the response info to the beginning of the list.
        this._responses.unshift(response); 
    }    

    /** Clear all responses in the response store. */
    clear() {
		// Clear the response array.
        this._responses = [];
    }

    /** Set the feedback property for all response items to false. */
    reset_feedback() {
        // Set all feedback properties 
        for (var i = 0;i < this._responses.length; i++) {
            this._responses[i].feedback = false;
        }
    }
}
 