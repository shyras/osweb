import Item from './item.js'
import { constants } from '../system/constants.js'

/**
 * Class representing a logger item.
 * @extends Item
 */
export default class Logger extends Item {
  /**
     * Create an experiment item which controls the OpenSesame experiment.
     * @param {Object} pExperiment - The experiment item to which the item belongs.
     * @param {String} pName - The unique name of the item.
     * @param {String} pScript - The script containing the properties of the item.
     */
  constructor (experiment, name, script) {
    super(experiment, name, script)
    this.description = 'Logs experimental data'
    this.from_string(script)
  }

  /** Implements the complete phase of an item. */
  _complete () {
    // Inherited.
    super._complete()
  }

  /** Reset all item variables to their default value. */
  reset () {
    this.logvars = []
    this.vars.auto_log = 'yes'
  }

  /**
     * Parse a definition string and retrieve all properties of the item.
     * @param {String} script - The script containing the properties of the item.
     */
  from_string (script) {
    this.reset()
    if (script !== null) {
      var lines = script.split('\n')
      for (var i = 0; i < lines.length; i++) {
        if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)) {
          var tokens = this.syntax.split(lines[i])
          if ((tokens[0] === 'log') && (tokens.length > 0)) {
            this.logvars.push(tokens[1])
          }
        }
      }
    }
    this.logvars.sort()
  }

  /** Implements the run phase of an item. */
  run () {
    super.run()
    if (this._status !== constants.STATUS_FINALIZE) {
      this._status = constants.STATUS_FINALIZE
      this.set_item_onset()
      this.experiment._log.write_vars(
        (this.vars.get('auto_log') === 'yes')
          ? this.logvars.concat(this.experiment.vars.inspect()).sort()
          : this.logvars
      )
      this._complete()
    }
  }
}
