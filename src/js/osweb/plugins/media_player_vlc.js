/*
 * Definition of the class media_player_vlc.
 */

(function() {
    function media_player_vlc(pExperiment, pName, pScript) {
        // Inherited.
        this.generic_response_constructor(pExperiment, pName, pScript);

        // Define and set the private properties. 
        this._script_executed = false;
    };

    // Extend the class from its base class.
    var p = osweb.extendClass(media_player_vlc, osweb.generic_response);

    // Define and set the public properties. 
    p.description = 'A video player';

    /*
     * Definition of public class methods - run cycle.
     */

    p.prepare = function() {
        // Opens the video file for playback.
        this._video = osweb.pool[this.vars.get('video_src')];
        this._video_player = new osweb.video_backend(this.experiment, this._video);

        // Set the inline code options.
        if (this.vars.event_handler !== '') {
            this._video_player._script = osweb.parser._prepare(this.vars.event_handler);
        }
        this._video_player._event_handler_always = (this.vars.event_handler_trigger == 'after every frame');

        // Set the audio option.
        this._video_player.audio = (this.vars.get('playaudio') == 'yes');

        // Set the full screen option (if enabled).
        this._video_player.full_screen = (this.vars.get('resizeVideo') == 'yes');

        // Inherited.	
        this.generic_response_prepare();
    };

    p.run = function() {
        // Set the onset time.
        this.set_item_onset();
        this.set_sri();

        // Start the video player.
        this._video_player.play();

        // Start response processing.
        this.process_response();
    };

    p.complete = function() {
        if (this._script_executed == false) {
            // Stop the video playing.  
            this._video_player.stop();

            // execute script.
            if ((this._video_player._script !== null) && (this.vars.get('event_handler_trigger') == 'on keypress')) {
                // Set the execute toggle.
                this._script_executed = true;

                // Execute the script code.
                osweb.parser._run(this, this._video_player._script);
            } else {
                // Inherited.	
                this.generic_response_complete();
            }
        } else {
            // Inherited.	
            this.generic_response_complete();
        };
    };

    p.update = function() {
        // Update the video canvas.
        this._video_player._update_video_canvas();
    };

    // Bind the media_player_vlc class to the osweb namespace.
    osweb.media_player_vlc = osweb.promoteClass(media_player_vlc, "generic_response");
}());