import MouseResponse from '../items/mouse_response.js'

/**
 * Class representing a reset feedback item.
 * @extends Item
 */
export default class TouchResponse extends MouseResponse {
  /**
     * Create a reset feedback  item which resets the feedback values.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
  constructor (experiment, name, script) {
    // Inherited.
    super(experiment, name, script)

    // Define and set the public properties.
    this.description = 'A grid-based response item, convenient for touch screens'
  }

  /** Resets all item variables to their default value. */
  reset () {
    // Inherited.
    super.reset()
    this.vars.set('allowed_responses', null)

    // Resets all item variables to their default value.
    this.vars._ncol = 2
    this.vars._nrow = 1
  }

  /** Implements the prepare phase of an item. */
  prepare () {
    // Temp hack
    this.experiment.vars.correct = -1

    // Inherited.
    super.prepare()
  }

  /**
     * Process a mouse click response.
     * @param {Object} pRetval - The mouse response to process.
     */
  process_response_mouseclick (retval) {
    super.process_response_mouseclick(retval)
    // Calulate the row, column and cell.
    this.col = Math.floor(
        (this.experiment.vars.cursor_x + this.experiment.vars.width / 2) /
        (this.experiment.vars.width / this.vars._ncol)
    )
    this.row = Math.floor(
        (this.experiment.vars.cursor_y + this.experiment.vars.height / 2) /
        (this.experiment.vars.height / this.vars._nrow)
    )
    this.cell = this.row * this.vars._ncol + this.col + 1
    this.experiment.vars.response = this.cell
    this.synonyms = [this.experiment.vars.get('response')]
  }
}
