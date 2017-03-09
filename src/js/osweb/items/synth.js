
/**
 * Class representing a synth item.
 * @extends Sampler
 */
osweb.synth= class Synth extends osweb.sampler {
    /**
     * Create a synth item which create a synthessised sound wave.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} Ssript - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
        // Inherited create.
        super(experiment, name, script);
        
        // Define and set the public properties. 
        this.description = 'A basic sound synthesizer';
    }
}