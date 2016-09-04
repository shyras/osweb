"use strict";
// Definition of the class clock.
function clock(experiment) {
    // Definition of private properties. 
    this._startTime = this._now(); // Start time anchor of the experiment.

    // Set the class public properties. 
    this.experiment = experiment; // Anchor to the experiment object.
};

// Extend the class from its base class.
var p = clock.prototype;

// Definition of public properties. 
p.experiment = null;

// Definition of private methods.   

p._now = function() {
    // Get the current time stamp using the best available timing method.
    if (window.performance.now) {
        return Math.round(window.performance.now());
    } else if (window.performance.webkitNow) {
        return Math.round(window.performance.webkitNow());
    } else {
        return new Date().getTime();
    }
};

// Definition of public methods.   

p.initialize = function() {
    // Set the absolute start time of the expeirment.
    this._startTime = this._now();
};

p.sleep = function(duration) {
    // Sleeps (pauses) for a duration (in milliseconds).
    if (this.experiment !== null) {
        // Set the event processor.
        osweb.events._run(this, duration, osweb.constants.RESPONSE_DURATION, null);
    }
};

p.time = function() {
    // Gives the current timestamp in milliseconds. 
    if (this._startTime !== -1) {
        return (this._now() - this._startTime);
    } else {
        return 0;
    }
};

module.exports = clock;