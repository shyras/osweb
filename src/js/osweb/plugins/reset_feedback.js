/*
 * Definition of the class reset_feedback.
 */

module.exports = function(osweb){
    function reset_feedback(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(reset_feedback, osweb.item);

    // Define and set the public properties. 
    p.description = 'Resets the feedback variables, such as "avg_rt" and "acc"';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Run item only one time.   
        if (this._status != osweb.constants.STATUS_FINALIZE) {
            // Run the item.
            this.experiment.reset_feedback();

            // Complete the current cycle.
            this.complete();
        }
    };

    p.complete = function() {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        this.item_complete();
    };

    // Bind the reset_feedback class to the osweb namespace.
    return osweb.promoteClass(reset_feedback, "item");
}