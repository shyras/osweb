(function() {
    // Definition of the class sampler.
    function sampler(experiment, src, volume, pitch, pan, duration, fade, block) {
        // Set the class public properties. 
        this.experiment = experiment;

        // Check if optional parameters are defined.
        this.block = (typeof block === 'undefined') ? false : block;
        this.duration = (typeof duration === 'undefined') ? 'sound' : duration;
        this.fade = (typeof fade === 'undefined') ? 0 : fade;
        this.pan = (typeof pan === 'undefined') ? 0 : pan;
        this.pitch = (typeof pitch === 'undefined') ? 1 : pitch;
        this.src = (typeof src === 'undefined') ? '' : src;
        this.volume = (typeof volume === 'undefined') ? 1 : volume;

        this._instance = null;

        // Create the sound instance
        if (src !== null) {
            // Set the sound object.  
            this._instance = src.data;
            // Set the event anchor for
            this._instance.onEnded = osweb.events._audioEnded.bind(this);
        }
    };

    // Extend the class from its base class.
    var p = sampler.prototype;

    // Definition of public properties. 
    p.duration = 'sound';
    p.block = false;
    p.fade = '0';
    p.pan = '0';
    p.pitch = '1';
    p.src = null;
    p.volume = 1;

    // Definition of public methods.
    p.play = function(volume, pitch, pan, duration, fade, block) {
        // Check if optional parameters are defined.
        this.block = (typeof block === 'undefined') ? this.block : block;
        this.duration = (typeof duration === 'undefined') ? this.duration : duration;
        this.fade = (typeof fade === 'undefined') ? this.fade : fade;
        this.pan = (typeof pan === 'undefined') ? this.pan : pan;
        this.pitch = (typeof pitch === 'undefined') ? this.pitch : pitch;
        this.volume = (typeof volume === 'undefined') ? this.volume : volume;

        if(this._instance != null){
            // Set the sound properties.
            this._instance.volume = this.volume;

            // Play the actual sound.
            this._instance.play();
        }
    };

    p.wait = function() {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_SOUND, []);
    };

    // Bind the sampler class to the osweb namespace.
    osweb.sampler_backend = sampler;
}());