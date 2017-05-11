import Item from '../items/item.js';
import { isNumber, isObject, isString }  from 'underscore';

/**
 * Class representing a advanced delay item.
 * @extends Item
 */
export default class AdvancedDelay extends Item {
    /**
     * Create an advanced delay plugin item which delays for e specific duration the experiment.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script);

        // Set public class properties.
        this.description = 'Waits for a specified duration';

        // Set private class properties.
        this._duration = -1;
    
        // Process the script.
        this.from_string(script);
    }

    /**
     * Gaussian distribution function.
     * @param {Number} mean - The mean value.
     * @param {Number} stdev - The standard deviation value.
     * @return {Number} - result value 
     */
    _random_gauss(mean, stdev) {
        var y2;
        var use_last = false;
        return function() {
            var y1;
            if (use_last) {
                y1 = y2;
                use_last = false;
            } else {
                var x1, x2, w;
                do {
                    x1 = 2.0 * Math.random() - 1.0;
                    x2 = 2.0 * Math.random() - 1.0;
                    w  = x1 * x1 + x2 * x2;               
                } while( w >= 1.0);
                
                w = Math.sqrt((-2.0 * Math.log(w)) / w);
                y1 = x1 * w;
                y2 = x2 * w;
                use_last = true;
            }
            var retval = mean + stdev * y1;
            if (retval > 0) 
               return retval;
            return -retval;
        }
    }

    /** Resets all item variables to their default value. */
    reset() {
        this.vars.duration = 1000;
        this.vars.jitter = 0;
        this.vars.jitter_mode = 'Uniform';
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Retrieve the duration value.
        this._duration = this.vars.duration;
        
        // Sanity check on the duration value, which should be positive numeric.
	    if ((!isNumber(this.vars.duration)) || (this.vars.duration < 0)) {
            this._runner._debugger.addError('Duration should be a positive numeric value in advanced_delay ' + this.name);
        }    
        if (this.vars.jitter_mode === 'Uniform') {
		    this._duration = Math.random(this.vars.duration - this.vars.jitter / 2, this.vars.duration + this.vars.jitter / 2)
        } else if (this.vars.jitter_mode === 'Std. Dev.') {
		    this._duration = this._random_gauss(this.vars.duration, this.vars.jitter)
        } else {
            this._runner._debugger.addError('Unknown jitter mode in advanced_delay ' + this.name);
        }

        // Don't allow negative durations.
	    if (this._duration < 0) {
		    this._duration = 0; 
        }    
	    this._duration = Number(this._duration)
	    this.experiment.vars.set('delay_' + this.name, this._duration)
	    this._runner._debugger.addMessage('delay for ' + this._duration + ' ms.');
        
        // Inherited.	
        super.prepare();
    }

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Set the onset time.
        this.set_item_onset(this.time());
        
        // Start the duration period.
        this.sleep(this._duration);
    }
}
