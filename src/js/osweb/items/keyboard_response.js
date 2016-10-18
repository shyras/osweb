/*
 * Definition of the class keyboard_response.
 */

module.exports = function(osweb){
    "use strict";
    function keyboard_response(pExperiment, pName, pScript) {
        // Inherited create.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties. 
        this._flush = 'yes';
        this._keyboard = new osweb.keyboard(this.experiment);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(keyboard_response, osweb.generic_response);

    // Definition of public properties. 
    p.description = 'Collects keyboard responses';

    /*
     * Definition of public methods - build cycle.
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.auto_response = 'space';
        this.process_feedback = true;
        this.vars.allowed_responses = null;
        this.vars.correct_response = null;
        this.vars.duration = 'keypress';
        this.vars.flush = 'yes';
        this.vars.timeout = 'infinite';
    };

    /*
     * Definition of public methods - run cycle.
     */

    p.prepare = function() {
        // Set the internal flush property.
        this._flush = (this.vars.flush) ? this.vars.flush : 'yes';

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.generic_response_run();

        // Record the onset of the current item.
        this.set_item_onset();

        // Flush responses, to make sure that earlier responses are not carried over.
        if (this._flush == 'yes') {
            this._keyboard.flush();
        }

        this.set_sri();
        this.process_response();
    };

    // Bind the keyboard_response class to the osweb namespace.
    return osweb.promoteClass(keyboard_response, "generic_response");
};