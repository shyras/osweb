/*
 * Definition of the class notepad.
 */

module.exports = function(osweb){
    "use strict";
    function notepad(pExperiment, pName, pScript) {
        // Inherited.
        this.item_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(notepad, osweb.item);

    // Define and set the public properties. 
    p.description = 'A simple notepad to document your experiment. This plug-in does nothing.';
    p.note = '';

    /*
     * Definition of public class methods - run cycle.
     */

    p.run = function() {
        // Inherited.	
        this.item_run();

        // Show the information of the notepad on the console.
        //osweb.debug.addMessage(this.note);

        // Complete the current cycle.
        this.complete();
    };

    p.complete = function() {
        // sequence is finalized.
        this._status = osweb.constants.STATUS_FINALIZE;

        // Inherited.	
        this.item_complete();
    };

    // Bind the notepad class to the osweb namespace.
    return osweb.promoteClass(notepad, "item");
};