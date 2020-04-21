import isFunction from 'lodash/isFunction'

/** Class representing a data logger. */
export default class Log {
  /**
   * Create a log object which stores all the response data.
   * @param {Object} experiment - The experiment to which the logger belongs.
   */
  constructor (experiment) {
    this._experiment = experiment // Anchor to the experiment object.
  }

  /**
   * Write one signle line to the message log.
   * @param {Array} varList - Array with variables to write to the log.
   */
  write_vars (varList) {
    const entry = {}
    for (const varName of varList) {
      const value = this._experiment.vars.get(varName, 'NA', false)
      if (isFunction(value)) continue
      entry[varName] = value
    }
    if (isFunction(this._experiment.onLog)) {
      this._experiment.onLog(entry)
    }
    this._experiment._runner._data.push(entry)
  }
}
