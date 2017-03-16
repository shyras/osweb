/**
 * Class representing a advanced delay item.
 * @extends Item
 */
import Item from '../items/item.js';

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

    /** Resets all item variables to their default value. */
    reset() {
        this.vars.duration = 1000;
        this.vars.jitter = 0;
        this.vars.jitter_mode = 'Uniform';
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        this._duration = this.vars.duration;
        /* # Sanity check on the duration value, which should be a positive numeric
	# value.
	if type(self.var.duration) not in (int, float) or self.var.duration < 0:
		raise osexception(
			u'Duration should be a positive numeric value in advanced_delay %s' \
			% self.name)
	if self.var.jitter_mode == u'Uniform':
		self._duration = random.uniform(self.var.duration-self.var.jitter/2,
			self.var.duration+self.var.jitter/2)
	elif self.var.jitter_mode == u'Std. Dev.':
		self._duration = random.gauss(self.var.duration, self.var.jitter)
	else:
		raise osexception(
			u'Unknown jitter mode in advanced_delay %s' % self.name)
	# Don't allow negative durations.
	if self._duration < 0:
		self._duration = 0
	self._duration = int(self._duration)
	self.experiment.var.set(u'delay_%s' % self.name, self._duration)
	debug.msg(u"delay for %s ms" % self._duration) */

        // Inherited.	
        super.prepare();
    };

    /** Implements the run phase of an item. */
    run() {
        // Inherited.	
        super.run();

        // Set the onset time.
        this.set_item_onset(this.time());
        this.sleep(this._duration);
    }
}
