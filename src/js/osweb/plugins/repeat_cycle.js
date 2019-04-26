import Item from '../items/item.js'
import { constants } from '../system/constants.js'

/**
 * Class representing a repeat cycle item.
 * @extends Item
 */
export default class RepeatCycle extends Item {
  /**
     * Create a repeat cycle item which repeat a cycle within a loop.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
  constructor (experiment, name, script) {
    // Inherited.
    super(experiment, name, script)

    // Define and set the public properties.
    this.description = 'Optionally repeat a cycle from a loop'

    // Process the script.
    this.from_string(script)
  }

  _complete () {
    // sequence is finalized.
    this._status = constants.STATUS_FINALIZE

    // Inherited.
    super._complete()
  }

  /** Implements the prepare phase of an item. */
  prepare () {
    // Inherited.
    super.prepare()
  }

  /** Implements the run phase of an item. */
  run () {
    // Inherited.
    super.run()

    // Prepare the condtion for which the repeat_cycle must fire.
    const condition = this.syntax.compile_cond(this.vars.get('condition'))
    // Run item only one time.
    if (this._status !== constants.STATUS_FINALIZE) {
      if (this.experiment._runner._pythonWorkspace._eval(condition) === true) {
        this.experiment.vars.repeat_cycle = 1
      }

      // Complete the current cycle.
      this._complete()
    }
  }
}
