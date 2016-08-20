// Definition of the class video.
function video(experiment, src) {
    // Set the class public properties. 
    this.experiment = experiment;

    // Set the class pivate properties. 
    this._playing = false;
    this._script = null;

    // Create the video instance
    if (src !== null) {
        // Set the video object.
        this._ctx = osweb.runner._canvas.getContext('2d');
        this._video = src.data;

        // Set the event anchors.
        this._video.onEnded = osweb.events._videoEnded.bind(this);
        this._video.onPlay = osweb.events._videoPlay.bind(this);
    }
};

// Extend the class from its base class.
var p = video.prototype;

// Definition of public properties. 
p.audio = true;
p.duration = 'keypress';
p.full_screen = false;

// Definition of private methods.

p._update_video_canvas = function() {
    // Clip the content of the video to the canvas.
    if (this._playing === true) {
        this._ctx.drawImage(this._video, 0, 0);

        // execute script.
        if ((this._script !== null) && (this._event_handler_always === true)) {
            // Start the parser
            osweb.parser._run(null, this._script);
        }
    }
};

// Definition of public methods.

p.play = function() {
    // Play the actual video.
    this._video.play();

    // Set the volume
    this._video.volume = (this.audio === true) ? 1 : 0;

    // Check if the video must be scaled.
    if (this.full_screen == true) {
        // Draw the first image with scaling.
        var xScale = (this.experiment._canvas._width / this._video.videoWidth);
        var yScale = (this.experiment._canvas._height / this._video.videoHeight);
        this._ctx.scale(xScale, yScale);
    }

    // Draw the first frame.
    this._ctx.drawImage(this._video, 0, 0);

    // Set the play toggle.
    this._playing = true;
};

p.stop = function() {
    // Pause the actual sound.
    this._video.pause();
    this._playing = false;
};

p.wait = function() {
    // Set the blocking of the sound.
    osweb.events._run(this, -1, osweb.constants.RESPONSE_VIDEO, []);
};

// Bind the video class to the osweb namespace.
module.exports = video;