/*
 * Definition of the class synth.
 */

module.exports = function(osweb){
    function synth(pExperiment, pName, pScript) {
        // Inherited.
        this.sampler_constructor(pExperiment, pName, pScript);
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(synth, osweb.sampler);

    // Define and set the public properties. 
    p.description = 'A basic sound synthesizer';

    /*
     * Definition of public class methods.
     */

    // Bind the synth class to the osweb namespace.
    return osweb.promoteClass(synth, "sampler");
}