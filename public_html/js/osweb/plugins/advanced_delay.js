
/*
 * Definition of the class advanced_delay.
 */

(function() 
{
    function advanced_delay(pExperiment, pName, pScript)
    {
	// Inherited.
	this.item_constructor(pExperiment, pName, pScript);
    
        // Set private properties.
        this._duration = -1;
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(advanced_delay, osweb.item);

    // Define and set the public properties. 
    p.description = 'Waits for a specified duration';

    /*
     * Definition of public class methods - build cycle.
     */

    p.reset = function()
    {
    	// Resets all item variables to their default value.
	this.vars.duration    = 1000;
	this.vars.jitter      = 0;
	this.vars.jitter_mode = 'Uniform';
    }; 
    
    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
        // Inherited.	
	this.item_prepare();

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
    };
    
    p.run = function() 
    {
        // Inherited.	
    	this.item_run();

        // Set the onset time.
        this.set_item_onset(this.time());
        this.sleep(this._duration);		
    };

    // Bind the advanced_delay class to the osweb namespace.
    osweb.advanced_delay = osweb.promoteClass(advanced_delay, "item");
}());
