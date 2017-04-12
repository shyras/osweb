import Item from '../items/item.js';
import Video from '../backends/video.js';

/**
 * Class representing a video player item.
 * @extends Item
 */
export default class MediaPlayer extends Item {
    /**
     * Create a video player plugin item which plays videos.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
    constructor(experiment, name, script) {
		// Inherited.
		super(experiment, name, script);

        // Define and set the public properties. 
        this.description = 'A video player';

        // Define and set the private properties. 
        this._script_executed = false;
   
        // Process the script.
        this.from_string(script);
    }

    /** Implements the complete phase of an item. */
    _complete() {
        if (this._script_executed == false) {
            // Stop the video playing.  
            this._video_player.stop();

            // execute script.
            if ((this._video_player._script !== null) && (this.vars.get('event_handler_trigger') === 'on keypress')) {
                // Set the execute toggle.
                this._script_executed = true;

                // Execute the script code.
                this._runner._pythonParser._run(this, this._video_player._script);
            } else {
                // Inherited.	
                super._complete();
            }
         } else {
            // Inherited.	
            super._complete();
        }
    }

    /** Implements the update phase of an item. */
    _update(response) {
        // Update the video canvas.
        this._video_player._update();
    }

    /** Implements the prepare phase of an item. */
    prepare() {
        // Opens the video file for playback.
        this._video = this.experiment.pool[this.vars.get('video_src')];
        this._video_player = new Video(this.experiment, this._video);

        // Set the inline code options.
        if (this.vars.event_handler !== '') {
            this._video_player._script = this._runner._pythonParser._parse(this.vars.event_handler);
        }
        this._video_player._event_handler_always = (this.vars.event_handler_trigger === 'after every frame');

        // Set the audio option.
        this._video_player.audio = (this.vars.get('playaudio') === 'yes');

        // Set the full screen option (if enabled).
        this._video_player.full_screen = (this.vars.get('resizeVideo') === 'yes');

        // Adjust the duration parameter from sound to video if defined.
        if (this.vars.duration === 'sound') {
            this.vars.duration = 'video';
        }
        this._video_player.duration = this.vars.duration; 

        // Inherited.	
        super.prepare();
    }

    /** Implements the run phase of an item. */
    run() {
        // Set the onset time.
        this.set_item_onset();
        this.set_sri();

        // Start the video player.
        this._video_player.play();

        // Start response processing.
        this.process_response();
    }
}
 