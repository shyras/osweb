import {
  constants
} from '../system/constants.js'

let audioCtx = null
try {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
} catch (e) {
  console.warning('Web Audio API is not supported in this browser')
}

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
  constructor (experiment, source, volume, pitch, pan, duration, fade, block) {
    // Create and set public properties.
    this.block = (typeof block === 'undefined') ? false : block
    this.duration = (typeof duration === 'undefined') ? 'sound' : duration
    this.experiment = experiment
    this.volume = (typeof volume === 'undefined') ? 1 : volume
    this.fade = (typeof fade === 'undefined') ? 0 : fade
    this.pan = (typeof pan === 'undefined') ? 0 : pan
    this.pitch = (typeof pitch === 'undefined') ? 1 : pitch

    this.sample = source.data.cloneNode()
    this.sample.onended = this.experiment._runner._events._audioEnded.bind(this)

    if (audioCtx) {
      this.source = audioCtx.createMediaElementSource(this.sample)
    } else {
      this.source = this.sample
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
  play (volume, pitch, pan, duration, fade, block) {
    // Check if optional parameters are defined.
    this.block = block || this.block
    this.duration = typeof duration === 'undefined' ? this.duration : duration
    this.volume = typeof volume === 'undefined' ? this.volume : volume
    this.pitch = typeof pitch === 'undefined' ? this.pitch : pitch
    this.pan = typeof pan === 'undefined' ? this.pan : pan
    this.fade = typeof fade === 'undefined' ? this.fade : fade

    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume()
      this.source.connect(this.applyFilters())
    } else {
      this.source.volume = this.volume
    }

    this.sample.play()
  }

  /** Set the blocking of the sound (wait period). */
  wait () {
    // Set the blocking of the sound.
    this.experiment._runner._events._run(this, -1, constants.RESPONSE_SOUND, [])
  }

  applyFilters () {
    const nodes = [audioCtx.destination]

    try {
      const gainNode = audioCtx.createGain()
      gainNode.gain.setValueAtTime(this.volume, audioCtx.currentTime)

      if (this.fade) {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        gainNode.gain.linearRampToValueAtTime(this.volume, audioCtx.currentTime + this.fade / 1000)
      }

      nodes.unshift(gainNode)
    } catch (e) {
      console.warning('Unable to apply volume or gain', e)
    }

    if (this.pan) {
      try {
        nodes.unshift(new StereoPannerNode(audioCtx, { pan: this.pan }))
      } catch (e) {
        console.warning('Unable to apply panning', e)
      }
    }

    // Connect the filters creating a chain
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] !== audioCtx.destination) {
        nodes[i].connect(nodes[i + 1])
      }
    }

    return nodes.shift(0)
  }
}
