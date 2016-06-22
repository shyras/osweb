
/*
 * Definition of the class media_player_vlc.
 */

(function() 
{
    function media_player_vlc(pExperiment, pName, pScript)
    {
	// Inherited.
	this.generic_response_constructor(pExperiment, pName, pScript);
    }; 
	
    // Extend the class from its base class.
    var p = osweb.extendClass(media_player_vlc, osweb.generic_response);

    // Define and set the public properties. 
    p.description = 'A video player';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function()
    {
  	// Opens the video file for playback."""
        this._video        = osweb.pool[this.vars.get('video_src')];  
        this._video_player = new osweb.video_backend(this.experiment, this._video);
        
	// Convert the string to a boolean, for slightly faster evaluations in the run phase.
	this._fullscreen = (this.vars.get('fullscreen') == 'yes');
	
        // The dimensions of the video
	// this._w = int(cv.GetCaptureProperty(self.video, cv.CV_CAP_PROP_FRAME_WIDTH))
	// this._h = int(cv.GetCaptureProperty(self.video, cv.CV_CAP_PROP_FRAME_HEIGHT))

        if (this._fullscreen)
        { 
            // In fullscreen mode, the video is always shown in the top-left and the temporary images need to be fullscreen size
            //this._x      = 0;
            //this._y      = 0;
            //this.src_tmp = cv.CreateMat(self.experiment.var.height, self.experiment.var.width, cv.CV_8UC3);
            //this.src_rgb = cv.CreateMat(self.experiment.var.height, self.experiment.var.width, cv.CV_8UC3);
        }
        else
        {    
            // Otherwise the location of the video depends on its dimensions and the temporary image is the same size as the video
            //this._x      = max(0, (self.experiment.var.width - self._w) / 2);
            //this._y      = max(0, (self.experiment.var.height - self._h) / 2);
            //this.src_rgb = cv.CreateMat(self._h, self._w, cv.CV_8UC3);
        }

      	// Inherited.	
	this.generic_response_prepare();
    };    
    
    p.run = function() 
    {
        // Set the onset time.
        this.set_item_onset();
	this.set_sri();

        // Start the video player.
        this._video_player.play();    

        // Start response processing.
        this.process_response();
    };

    p.complete = function() 
    {
	// Stop the video playing.
	this._video_player.stop();
		
	// Inherited.	
	this.generic_response_complete();
    };    
    
    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());
