/*
 * Definition of the class sampler.
 */

(function() {
    function sampler(pExperiment, pName, pScript) {
        // Inherited.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Definition of private properties.
        this._sample = null;
        this._sampler = null;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(sampler, osweb.generic_response);

    // Definition of public properties.
    p.block = false;
    p.description = 'Plays a sound file in .wav or .ogg format';

    /*
     * Definition of public methods - build cycle. 
     */

    p.reset = function() {
        // Resets all item variables to their default value.
        this.block = false;
        this.vars.sample = '';
        this.vars.pan = 0;
        this.vars.pitch = 1;
        this.vars.fade_in = 0;
        this.vars.stop_after = 0;
        this.vars.volume = 1;
        this.vars.duration = 'sound';
    };

    /*
     * Definition of public methods - run cycle. 
     */

    p.prepare = function() {
        // Create the sample
        if (this.vars.sample != '') {
            // Retrieve the content from the file pool.
            this._sample = osweb.pool[this.syntax.eval_text(this.vars.sample)];
            this._sampler = new osweb.sampler_backend(this.experiment, this._sample);
            this._sampler.volume = this.vars.volume;
        } else {
            /* raise osexception(
            u'No sample has been specified in sampler "%s"' % self.name) */
        }

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        this.set_item_onset();
        this.set_sri();
        this._sampler.play();
        this.process_response();
    };

    // Bind the sampler class to the osweb namespace.
    osweb.sampler = osweb.promoteClass(sampler, "generic_response");
}());