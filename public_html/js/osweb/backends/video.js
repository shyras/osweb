/*
 * Definition of the class video.
 */

(function() 
{
    function video(pExperiment, pSrc)
    {
      	// Set the class public properties. 
	this.experiment = pExperiment;
	
	// Create the sound instance
	if (pSrc != null)
	{
            // Set the sound object.
            this._ctx   = osweb.runner._canvas.getContext('2d');
            this._video = pSrc.data;
            
            // Set the event anchor for 
            this._video.on("ended"     , osweb.events._videoEnded.bind(this));
            this._video.on("timeupdate", osweb.events._videoUpdate.bind(this));
    	}
    }; 
	
    // Extend the class from its base class.
    var p = video.prototype;
    
    // Define the public properties. 
    p.duration = 'video';	
    
    /*
     * Definition of class public methods.
     */
    
    p.play = function()
    {
	// Play the actual video.
        this._video.play();	
    };

    p.stop = function()
    {
	// Pause the actual sound.
	this._video.pause();	
    };

    p.wait = function()
    {
        // Set the blocking of the sound.
        osweb.events._run(this, -1, osweb.constants.RESPONSE_VIDEO,[]);
    };
    
    // Bind the video class to the osweb namespace.
    osweb.video_backend = video;
}());
