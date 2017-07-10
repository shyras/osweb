import * as PIXI from 'pixi.js';
import * as sound from 'pixi-sound';
import { constants } from '../system/constants.js';

/** Class representing a sampler. */
export default class SamplerBackend {
    /**
     * Create a sampler object which controls the sampler device.
     * @param {Object} experiment - The experiment to which the sampler belongs.
     * @param {String} source - The sound source name.
     * @param {Number} volume - The volume to use when playing the sound.
     * @param {Number} pitch - The pitch to use when playing the sound.
     * @param {Number} pan - The pan to use when playing the sound.
     * @param {String} duration - The duration of the sound.
     * @param {Number} fade - The fade to use when playing the sound.
     * @param {Boolean} block - If true use the sound ad a block wave.
     */
    constructor(experiment, source, volume, pitch, pan, duration, fade, block) {
        // Create and set public properties. 
        this.block = (typeof block === 'undefined') ? false : block;
        this.duration = (typeof duration === 'undefined') ? 'sound' : duration;
        this.experiment = experiment;
        this.fade = (typeof fade === 'undefined') ? 0 : fade;
        this.pan = (typeof pan === 'undefined') ? 0 : pan;
        this.pitch = (typeof pitch === 'undefined') ? 1 : pitch;
        this.source = (typeof source === 'undefined') ? null : source;
        this.volume = (typeof volume === 'undefined') ? 1 : volume;

        // Create and set private properties. 
        this._instance = '';

        // Create the sound instance
        if (source !== null) {
            // Set the sound object.  
            this._name = source.name;
            
            // Check if the sourse is not already in the sound. 
            if (PIXI.sound.exists(source.name) === false) { 
                console.log('adding sound' + source.name);
                PIXI.sound.add(source.name, {
                    src: source.data.src,
                    preload: true,
                    complete: this.experiment._runner._events._audioEnded.bind(this)
                });
            }    
        }
    }

    /**
     * Play a sound file.
     * @param {Number} volume - The volume to use when playing the sound.
     * @param {Number} pitch - The pitch to use when playing the sound.
     * @param {Number} pan - The pan to use when playing the sound.
     * @param {String} duration - The duration of the sound.
     * @param {Number} fade - The fade to use when playing the sound.
     * @param {Boolean} block - If true use the sound ad a block wave.
     */
    play(volume, pitch, pan, duration, fade, block) {
        // Check if optional parameters are defined.
        this.block = (typeof block === 'undefined') ? this.block : block;
        this.duration = (typeof duration === 'undefined') ? this.duration : duration;
        this.fade = (typeof fade === 'undefined') ? this.fade : fade;
        this.pan = (typeof pan === 'undefined') ? this.pan : pan;
        this.pitch = (typeof pitch === 'undefined') ? this.pitch : pitch;
        this.volume = (typeof volume === 'undefined') ? this.volume : volume;

        console.log(this._name);
        console.log(PIXI.sound);

        if (this._name !== '') {
            // Set the sound properties.
            //PIXI.sound.volume(this._name, this.volume);
        
            // Play the actual sound.   
            PIXI.sound.play(this._name);
        }
    }

    /** Set the blocking of the sound (wait period). */
    wait() {
        // Set the blocking of the sound.
        this.experiment._runner._events._run(this, -1, constants.RESPONSE_SOUND, []);
    }
}
