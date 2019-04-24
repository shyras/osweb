import {
  isNumber,
  shuffle,
  sortBy
} from 'lodash'

import Keyboard from '../backends/keyboard.js'
import {
  constants
} from '../system/constants.js'
import Item from './item.js'

import {
  fullfactorial,
  shuffleVert,
  shuffleHoriz,
  sortCol,
  reverseRows,
  roll,
  weight
} from '../util/matrix'

/**
 * Class representing a sequence item.
 * @extends Item
 */
export default class Loop extends Item {
  /**
   * Create an experiment item which controls the OpenSesame experiment.
   * @param {Object} experiment - The experiment item to which the item belongs.
   * @param {String} name - The unique name of the item.
   * @param {String} script - The script containing the properties of the item.
   */
  constructor (experiment, name, script) {
    // Inherited create.
    super(experiment, name, script)

    // Definition of public properties.
    this.description = 'Repeatedly runs another item'
    this.matrix = null

    // Definition of private properties.
    this._break_if = ''
    this._cycles = []
    this._index = -1
    this._keyboard = null

    // Process the script.
    this.from_string(script)
  }

  /** Implements the complete phase of an item. */
  _complete () {
    // Check if if the cycle must be repeated.
    if (this.experiment.vars.repeat_cycle === 1) {
      this.experiment._runner._debugger.msg('Repeating cycle: ' + this._index)

      this._cycles.push(this._index)

      if (this.vars.order === 'random') {
        this._cycles = shuffle(this._cycles)
      }
    } else {
      // All items are processed, set the status to finalized.
      this._status = constants.STATUS_FINALIZE

      // Inherited.
      super._complete()
    }
  }

  /** Reset all item variables to their default value. */
  reset () {
    this.matrix = []
    this.vars.cycles = 1
    this.vars.repeat = 1
    this.vars.skip = 0
    this.vars.offset = 'no'
    this.vars.order = 'random'
    this.vars.item = ''
    this.vars.break_if = 'never'
  }

  /**
   * Parse a definition string and retrieve all properties of the item.
   * @param {String} script - The script containing the properties of the item.
   */
  from_string (script) {
    // Creates a loop from a definition in a string.
    this.comments = []
    this.variables = {}
    this.reset()

    // Split the string into an array of lines.
    if (script != null) {
      const lines = script.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if ((lines[i] !== '') && (this.parse_variable(lines[i]) === false)) {
          const [instruction, ...params] = this.syntax.split(lines[i])

          switch (instruction) {
            case 'run':
              if (params.length > 0) this.vars.item = params[0]
              break
            case 'setcycle':
              if (params.length <= 2) {
                this._runner._debugger.addError(`Incorrect setcycle command in item ${this.name}`)
                break
              }
              const cycle = params[0]
              const name = params[1]
              let value = this.syntax.remove_quotes(params[2])
              // Check if the value is numeric
              value = isNumber(value) ? Number(value) : value
              // If a python expression, convert to javascript.
              if (value[0] === '=') {
                // Parse the python statement.
                value = this.experiment._runner._pythonParser._prepare(value.slice(1))
                if (value !== null) {
                  value = value.body[0]
                }
              }
              if (this.matrix[cycle] === undefined) {
                this.matrix[cycle] = {}
              }
              this.matrix[cycle][name] = value
              break
            case 'fullfactorial':
              this.matrix = fullfactorial(this.matrix)
              // Set the number of cycles to the length of the generated matrix
              this.vars.cycles = this.matrix.length
              break
            case 'shuffle':
              this.matrix = shuffleVert(this.matrix, params)
              break
            case 'shuffle_horiz':
              this.matrix = shuffleHoriz(this.matrix, params)
              break
            case 'slice':
              this.matrix = this.matrix.slice(...params)
              // Set the number of cycles to the length of the generated matrix
              this.vars.cycles = this.matrix.length
              break
            case 'sort':
              this.matrix = sortCol(this.matrix, ...params)
              break
            case 'sortby':
              this.matrix = sortBy(this.matrix, params)
              break
            case 'reverse':
              this.matrix = reverseRows(this.matrix, params)
              break
            case 'roll':
              this.matrix = roll(this.matrix, ...params)
              break
            case 'weight':
              this.matrix = weight(this.matrix, ...params)
              // Set the number of cycles to the length of the generated matrix
              this.vars.cycles = this.matrix.length
              break
          }
        }
      }
    }
  }

  /**
   * Prepares the variables for one single cycle within the loop.
   * @param {Number} cycle -The cycle to apply.
   */
  apply_cycle (cycle) {
    // Sets all the loop variables according to the cycle.
    if (cycle in this.matrix) {
      for (const variable in this.matrix[cycle]) {
        // Get the value of the variable.
        let value = this.matrix[cycle][variable]

        // Check for python expression.
        if (typeof value === 'object') {
          // value contains ast tree, run the parser.
          try {
            // Evaluate the expression
            value = this.experiment._runner._pythonParser._runstatement(value)
          } catch (e) {
            // Error during evaluation.
            this.experiment._runner._debugger.addError(
              'Failed to evaluate experssion in in loop item: ' + this.name + ' (' + value + ')')
          }
        }

        // Set the variable.
        this.experiment.vars.set(variable, value)
      }
    }
  }

  /** Implements the prepare phase of an item. */
  prepare () {
    //  First generate a list of cycle numbers
    this._cycles = []
    this._index = 0

    // Walk through all complete repeats
    var wholeRepeats = Math.floor(this.vars.get('repeat'))
    for (let j = 0; j < wholeRepeats; j++) {
      for (let i = 0; i < this.vars.cycles; i++) {
        this._cycles.push(i)
      }
    }

    // Add the leftover repeats.
    const partialRepeats = this.vars.get('repeat') - wholeRepeats
    if (partialRepeats > 0) {
      const allCycles = Array.apply(null, {
        length: this.vars.cycles
      }).map(Number.call, Number)
      const remainder = Math.floor(this.vars.cycles * partialRepeats)
      for (let i = 0; i < remainder; i++) {
        // Calculate random position.
        const position = Math.floor(Math.random() * allCycles.length)
        // Add position to cycles.
        this._cycles.push(position)
        // Remove position from array.
        allCycles.splice(position, 1)
      }
    }

    // Randomize the list if necessary.
    if (this.vars.get('order') === 'random') {
      this._cycles = shuffle(this._cycles)
    } else {
      const skipVal = this.vars.get('skip')
      // In sequential order, the offset and the skip are relevant.
      if (this._cycles.length < skipVal) {
        this.experiment._runner._debugger.addError('The value of skip is too high in loop item. You cannot skip more cycles than there are in: ' + this.name)
      } else {
        if (this.vars.get('offset') === 'yes') {
          // Get the skip elements.
          const skip = this._cycles.slice(0, skipVal)

          // Remove the skip elements from the original location.
          this._cycles = this._cycles.slice(skipVal)

          // Add the skip element to the end.
          this._cycles = this._cycles.concat(skip)
        } else {
          this._cycles = this._cycles.slice(skipVal)
        }
      }
    }

    // Create a keyboard to flush responses between cycles.
    this._keyboard = new Keyboard(this.experiment)

    // Make sure the item to run exists.
    if (this.experiment.items._items[this.vars.item] === 'undefined') {
      this.experiment._runner._debugger.addError('Could not find an item which is called by loop item: ' + this.name + ' (' + this.vars.item + ')')
    }

    // Inherited.
    super.prepare()

    // Set the onset time.
    this.set_item_onset()
  }

  /** Implements the run phase of an item. */
  run () {
    // Inherited.
    super.run()

    // Prepare the break if condition.
    const break_if_val = this.vars.get('break_if')
    this._break_if = ['never', ''].includes(break_if_val)
      ? null
      : this.syntax.compile_cond(break_if_val)

    if (this._cycles.length > 0) {
      this._index = this._cycles.shift()
      this.apply_cycle(this._index)

      // Check the break_if flag.
      if (this._break_if !== null) {
        this.python_workspace['this'] = this

        const breakIf = this.syntax.eval_text(this._break_if, null, true)

        if (this.python_workspace._eval(breakIf) === true) {
          this._complete()
          return
        }
      }

      this.experiment.vars.repeat_cycle = 0

      // Replace with execute
      if (this._runner._itemStore._items[this.vars.item].type === 'sequence') {
        this.experiment._runner._itemStore.prepare(this.vars.item, this)
      } else {
        this.experiment._runner._itemStore.execute(this.vars.item, this)
      }
    } else {
      // Break the loop.
      this._complete()
    }
  }
}
