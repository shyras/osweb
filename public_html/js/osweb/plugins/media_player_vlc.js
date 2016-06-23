
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
        // Opens the video file for playback.
        this._video        = osweb.pool[this.vars.get('video_src')];  
        this._video_player = new osweb.video_backend(this.experiment, this._video);
        
        // Set the script code option.
        if (this.vars.event_handler !== '')
        {
            this._video_player._script = osweb.parser._prepare(this.vars.event_handler);
        }
        
        // Set the full screen option (if enabled).
        this._video_player.full_screen = (this.vars.get('resizeVideo') == 'yes');
	
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
        console.log('video complete.');    
        
        // Stop the video playing.
	this._video_player.stop();
		
	// Inherited.	
	this.generic_response_complete();
    };    
    
    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());
