/*
 * Definition of the class sampler.
 */

(function() 
{
    function sampler(pExperiment, pSrc, PVolume, pPitch, pPan, pDuration, pFade, pBlock)
    {
      	// Set the class public properties. 
	this.experiment = pExperiment;
	
	// Check if optional parameters are defined.
	this.block    = (typeof pBlock    === 'undefined') ? false   : pBlock;	
	this.duration = (typeof pDuration === 'undefined') ? 'sound' : pDuration;	
	this.fade     = (typeof pFade     === 'undefined') ? 0       : pFade;	
	this.pan      = (typeof pPan      === 'undefined') ? 0       : pPan;	
	this.pitch    = (typeof pPitch    === 'undefined') ? 1       : pPitch;	
	this.src      = (typeof pSrc      === 'undefined') ? ''      : pSrc;	
	this.volume   = (typeof pVolume   === 'undefined') ? 1       : pVolume;	

	// Create the sound instance
	if (pSrc != null)
	{
            // Set the sound object.
            this._instance = pSrc.data;
		
            // Set the event anchor for 
            this._instance.on("ended", osweb.events._audioEnded.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = sampler.prototype;
    
    // Define the public properties. 
    p.duration = 'sound';	
    p.block    = false;
    p.fade     = '0';
    p.pan      = '0';
    p.pitch    = '1';
    p.src      = null;
    p.volume   = 1;
    
    /*
     * Definition of class public methods.
     */

    p.play = function(PVolume, pPitch, pPan, pDuration, pFade, pBlock)
    {
	// Check if optional parameters are defined.
	this.block    = (typeof pBlock    === 'undefined') ? this.block    : pBlock;	
	this.duration = (typeof pDuration === 'undefined') ? this.duration : pDuration;	
	this.fade     = (typeof pFade     === 'undefined') ? this.fade     : pFade;	
	this.pan      = (typeof pPan      === 'undefined') ? this.pan      : pPan;	
	this.pitch    = (typeof pPitch    === 'undefined') ? this.pitch    : pPitch;	
	this.volume   = (typeof pVolume   === 'undefined') ? this.volume   : pVolume;	

	// Set the sound properties.
	this._instance.volume = this.volume;
		
	// Play the actual sound.
	this._instance.play();	
    };

    p.wait = function()
    {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_SOUND,[]);
    };
    
    // Bind the sampler class to the osweb namespace.
    osweb.sampler_backend = sampler;
}());

