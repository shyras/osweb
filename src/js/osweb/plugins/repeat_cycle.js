
/*
 * Definition of the class repeat_cycle.
 */

module.exports = function(osweb){
    "use strict";
    function repeat_cycle(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(repeat_cycle, osweb.item);

    // Define and set the public properties. 
    p.description = 'Optionally repeat a cycle from a loop';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
        // Prepare the condtion for which the repeat_cycle must fire.
        this._condition = osweb.syntax.compile_cond(this.vars.get('condition'));

        // Inherited.	
        this.item_prepare();
    };

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Run item only one time.   
        if (this._status != osweb.constants.STATUS_FINALIZE) {
            if (osweb.python_workspace._eval(this._condition) == true) {
                this.experiment.vars.repeat_cycle = 1;
            }

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

    // Bind the repeat_cycle class to the osweb namespace.
    return osweb.promoteClass(repeat_cycle, "item");
}