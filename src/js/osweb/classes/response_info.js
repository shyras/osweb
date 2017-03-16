/** Class representing a ResponseInfo object */
export default class ResponseInfo {
    /**
     * Create an object which stores information about one single response.
     * @param {Object} responseStore - The store for the response object.
     * @param {String} response - The response chracter itself.
     * @param {Boolean|Number} correct - Correct of incorrect response.
     * @param {Number} responseTime - Correct of incorrect response.
     * @param {Object} item - The item to which the response belongs.
     * @param {Boolean} feedback - If true the reponse is evaluated for feedback.
     */
    constructor(responseStore, response, correct, responseTime, item, feedback) {
        // Create and set private properties. 
        this._responseStore = responseStore;
       
        // Create and set public properties. 
        this.correct = correct;
        this.feedback = feedback;
        this.item = item;
        this.respons = response;
        this.responseTime = responseTime;
    }    

    /** Select item if match the selected property. */
    match(kwdict) {
    }

    /** Select item if no match the selected property. */
    matchnot(kwdict) {
    }
}
 