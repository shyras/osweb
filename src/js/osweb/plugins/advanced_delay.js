import Item from '../items/item.js'
import {
  isNumber
} from 'lodash'

/**
 * Class representing a advanced delay item.
 * @extends Item
 */
export default class AdvancedDelay extends Item {
  /**
   * Create an advanced delay plugin item which delays for e specific duration the experiment.
   * @param {Object} experiment - The experiment item to which the item belongs.
   * @param {String} name - The unique name of the item.
   * @param {String} script - The script containing the properties of the item.
   */
  constructor (experiment, name, script) {
    super(experiment, name, script)
    this.description = 'Waits for a specified duration'
    this._duration = -1
    this.from_string(script)
  }

  /**
   * Gaussian distribution function.
   * @param {Number} mean - The mean value.
   * @param {Number} std - The standard deviation value.
   * @return {Number} - result value
   */
  _random_gauss(mean, std) {
    let u = 0
    let v = 0
     while(u === 0) u = Math.random()
     while(v === 0) v = Math.random()
     return Math.max(0, mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI*v) * std)
  }

  /**
   * Uniform distribution function.
   * @param {Number} mean - The mean value.
   * @param {Number} stdev - The standard deviation value.
   * @return {Number} - result value
   */
  _random_uniform (mean, jitter) {
    return Math.max(0, Math.floor(mean + Math.random() * jitter - jitter / 2))
  }

  /** Resets all item variables to their default value. */
  reset () {
    this.vars.duration = 1000
    this.vars.jitter = 0
    this.vars.jitter_mode = 'Uniform'
  }

  /** Implements the prepare phase of an item. */
  prepare () {
    let duration = this.vars.get('duration')
    let jitter = this.vars.get('jitter')
    let jitter_mode = this.vars.get('jitter_mode')
    if ((!isNumber(duration)) || (duration < 0)) {
      this._runner._debugger.addError('Duration should be a positive numeric value in advanced_delay ' + this.name)
    }
    if (jitter_mode === 'Uniform') {
      this._duration = this._random_uniform(duration, jitter)
    } else if (jitter_mode === 'Std. Dev.') {
      this._duration = this._random_gauss(duration, jitter)
    } else {
      this._runner._debugger.addError('Unknown jitter mode in advanced_delay ' + this.name)
    }
    if (this._duration < 0) {
      this._duration = 0
    }
    this._duration = Number(this._duration)
    this.experiment.vars.set('delay_' + this.name, this._duration)
    this._runner._debugger.addMessage('delay for ' + this._duration + ' ms.')
    super.prepare()
  }

  /** Implements the run phase of an item. */
  run () {
    super.run()
    this.set_item_onset(this.time())
    this.sleep(this._duration)
  }
}
