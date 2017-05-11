import { constants } from '../system/constants.js';

/** Class representing the clock system. */
export default class Clock {
    /**
     * Create a clock object which controls a pseudo real-time clock.
     * @param {Object} experiment - The experiment  to which the clock belongs.
     */
    constructor(experiment) {
        // Create and set private properties. 
        this._experiment = experiment; // Parent experiment item.    
        this._startTime = -1; // Start time anchor of the experiment.
    }

    /** Initialize the clock. */
    _initialize() {
        // Set the absolute start time of the expeirment.
        this._startTime = this._now();
    }

    /** Get an absolute time stamp from the system in ms. 
     * @return {Number} - The current absolute time in ms.
     */
    _now() {
        // Get the current time stamp using the best available timing method.
        if (window.performance.now) {
            return Math.round(window.performance.now());
        } else if (window.performance.webkitNow) {
            return Math.round(window.performance.webkitNow());
        } else {
            return new Date().getTime();
        }
    }

    /**
     * Sleeps (pauses) for a duration (in milliseconds).
     * @param {Number} ms - The duration to wait in ms.
     */
    sleep(ms) {
        // Sleeps (pauses) for a duration (in milliseconds).
        if (this._experiment !== null) {
            // Set the event processor.
            this._experiment._runner._events._run(ms, constants.RESPONSE_DURATION, null);
        }
    }

    /** Get the relative time from the start of an experiment.
     * @return {Number} - The current relative time in ms.
     */
    time() {
        // Gives the current timestamp in milliseconds. 
        if (this._startTime !== -1) {
            return (this._now() - this._startTime);
        } else {
            return 0;
        }
    }
} 
 