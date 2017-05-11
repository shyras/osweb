import * as PIXI from 'pixi.js';
import { constants } from '../system/constants.js';

/** Class representing a video. */
export default class Video {
    /**
     * Create a video object which controls the video device.
     * @param {Object} experiment - The experiment to which the video belongs.
     * @param {String} src - The video source name.
     */
    constructor(experiment, source) {
        // Set class parameter properties.
        this._experiment = experiment;

        // Set the class public properties. 
        this.audio = true;
        this.duration = 'keypress';
        this.full_screen = false;

        // Set the class pivate properties. 
        this._playing = false;
        this._script = null;

        // Create the video instance
        if (source !== null) {
            // Set the video object.
            this._video = source.data;
            
            // create a video texture from the video.
            this._texture = new PIXI.Texture.fromVideo(source.data);
            
            // create a new Sprite using the video texture (yes it's that easy)
            this._videoSprite = new PIXI.Sprite(this._texture);
            this._video.pause();
            
            // Set the event anchors.
            this._video.onended = this._experiment._runner._events._videoEnded.bind(this);
            this._video.onplay = this._experiment._runner._events._videoPlay.bind(this);
        }
    }

    /** Update the video rendering. */ 
    _update() {
        if (this._playing === true) {
            // Update the renderer.
            this._experiment._runner._renderer.render(this._videoSprite);

            // execute script.
            if ((this._script !== null) && (this._event_handler_always === true)) {
                // Start the parser
                this._experiment._runner._pythonParser._run(null, this._script);
            }
        }
    }

    /** Play the actual video. */
    play() {
        // Enable the video playing.
        this._video.play();
        
        // Set the volume
        this._video.volume = (this.audio === true) ? 1 : 0;

        // Check if the video must be scaled.
        if (this.full_screen === true) {
            this._videoSprite.width = this._experiment._runner._renderer.width;
            this._videoSprite.height = this._experiment._runner._renderer.height;
        } 

        // Render the first frame.
        this._experiment._runner._renderer.render(this._videoSprite);

        // Set the play toggle.
        this._playing = true; 
    }

    /** Stop playing the video. */
    stop() {
        // Pause the actual sound.
        this._video.pause();
        this._playing = false;
    }

    /** Set the blocking of the sound. */
    wait() {
        this._experiment._runner._events._run(-1, constants.RESPONSE_VIDEO, []);
    }
}   
  