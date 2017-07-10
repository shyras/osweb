import GenericResponse from './generic_response.js';
import SamplerBackend from '../backends/sampler.js';
import Syntax from '../classes/syntax.js';

/**
 * Class representing a sampler item.
 * @extends GenericResponse
 */
export default class Sampler extends GenericResponse {
    /**
     * Create a sampler  item which plays a sound.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
        // Inherited create.
        super(experiment, name, script);

        // Definition of public properties.
        this.block = false;
        this.description = 'Plays a sound file in .wav or .ogg format';

        // Definition of private properties.
        this._sample = null;
        this._sampler = null;

        // Process the script.
        this.from_string(script);
    }

    /** Reset all item variables to their default value. */
    reset() {
        this.block = false;
        this.vars.sample = '';
        this.vars.pan = 0;
        this.vars.pitch = 1;
        this.vars.fade_in = 0;
        this.vars.stop_after = 0;
        this.vars.volume = 1;
        this.vars.duration = 'sound';
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Create the sample
        if (this.vars.sample !== '') {
            // Retrieve the content from the file pool.
            this._sample = this._runner._pool[this.syntax.eval_text(this.vars.sample, this.vars, false)];
            this._sampler = new SamplerBackend(this.experiment, this._sample);
            this._sampler.volume = this.vars.volume;
            this._sampler.duration = this.vars.duration;
            this._sampler.fade = this.vars.fade;
            this._sampler.pan = this.vars.pan;
            this._sampler.pitch = this.vars.pitch;
        } else {
            // Show error message.
            this._debugger.addError('No sample has been specified in sampler: ' + this.vars.sample);
        }

        // Inherited.	
        super.prepare();
    }

    /** Implements the run phase of an item. */
    run() {
        this.set_item_onset();
        this.set_sri();
        this._sampler.play();
        this.process_response();
    }
}