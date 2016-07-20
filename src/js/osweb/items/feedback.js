/*
 * Definition of the class feedback.
 */

(function() {
    function feedback(pExperiment, pName, pScript) {
        // Inherited create.
        this.sketchpad_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(feedback, osweb.sketchpad);

    // Definition of public properties. 
    p.description = 'Provides feedback to the participant';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.sketchpad_reset();
        this.vars.reset_variables = 'yes';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Prepares the item.
        this._parent.prepare_complete();
    };

    p.run = function() {
        // Inherited.	
        this.sketchpad_prepare();
        this.sketchpad_run();
    };

    p.complete = function() {
        // Inherited.	
        this.sketchpad_complete();

        // Reset feedback variables.
        if (this.vars.reset_variables == 'yes') {
            this.experiment.reset_feedback();
        }
    };

    // Bind the feedback class to the osweb namespace.
    osweb.feedback = osweb.promoteClass(feedback, "sketchpad");
}());