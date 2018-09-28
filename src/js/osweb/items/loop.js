import combos from 'combos'
import isNumber from 'lodash/isNumber'
import isArray from 'lodash/isArray'
import shuffle from 'lodash/shuffle'
import zip from 'lodash/zip'
import zipObject from 'lodash/zipObject'
import fromPairs from 'lodash/fromPairs'
import pick from 'lodash/pick'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'

import Keyboard from '../backends/keyboard.js'
import { constants } from '../system/constants.js'
import Item from './item.js'

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
    this.matrix = {}
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
              break
            case 'sort':
              this.matrix = sortCol(this.matrix, params)
              break
            case 'sortby':
              this.matrix = sortBy(this.matrix, params)
              break
            case 'reverse':
              this.matrix = reverseRows(this.matrix, params)
              break
            case 'roll':
              this.matrix = roll(this.matrix, params)
              break
            case 'weight':
              this.matrix = weight(this.matrix, params)
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
    // Prepare the break if condition.
    if ((this.vars.break_if !== '') && (this.vars.break_if !== 'never')) {
      this._break_if = this.syntax.compile_cond(this.vars.break_if)
    } else {
      this._break_if = null
    }

    //  First generate a list of cycle numbers
    this._cycles = []
    this._index = 0

    // Walk through all complete repeats
    var wholeRepeats = Math.floor(this.vars.repeat)
    for (let j = 0; j < wholeRepeats; j++) {
      for (let i = 0; i < this.vars.cycles; i++) {
        this._cycles.push(i)
      }
    }

    // Add the leftover repeats.
    const partialRepeats = this.vars.repeat - wholeRepeats
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
    if (this.vars.order === 'random') {
      this._cycles = shuffle(this._cycles)
    } else {
      // In sequential order, the offset and the skip are relevant.
      if (this._cycles.length < this.vars.skip) {
        this.experiment._runner._debugger.addError('The value of skip is too high in loop item. You cannot skip more cycles than there are in: ' + this.name)
      } else {
        if (this.vars.offset === 'yes') {
          // Get the skip elements.
          const skip = this._cycles.slice(0, this.vars.skip)

          // Remove the skip elements from the original location.
          this._cycles = this._cycles.slice(this.vars.skip)

          // Add the skip element to the end.
          this._cycles = this._cycles.concat(skip)
        } else {
          this._cycles = this._cycles.slice(this.vars.skip)
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

    if (this._cycles.length > 0) {
      let exit = false
      this._index = this._cycles.shift()
      this.apply_cycle(this._index)

      // Check the break_if flag.
      if (this._break_if !== null) {
        this.python_workspace['this'] = this

        const breakIf = this.syntax.eval_text(this._break_if, null, true)

        if (this.python_workspace._eval(breakIf) === true) {
          exit = true
        }
      }

      // Check the exit status.
      if (exit === false) {
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
    } else {
      // Break the loop.
      this._complete()
    }
  }
}

/**
 * Utility functions
 */

/**
 * Group matrix values by their variables names
 *
 * @param {Object} srcMatrix The source matrix to transform
 * @returns {Object}
 */
function unstack (srcMatrix) {
  return Object.values(srcMatrix).reduce((acc, cycle) => {
    for (const [key, val] of Object.entries(cycle)) {
      if (key in acc) {
        acc[key].push(val)
      } else {
        acc[key] = [val]
      }
    }
    return acc
  }, {})
}

/**
 * Convert grouped by variable matrix back to a normal matrix
 * @param {array} srcMatrix
 * @returns {array}
 */
function stack (srcMatrix) {
  const columns = Object.keys(srcMatrix)
  const rows = zip(...Object.values(srcMatrix))
  return rows.map(row => zipObject(columns, row))
}

/**
 * Creates a full factorial design of all the variable values in the matrix
 * @param {array} matrix The array of cycles to fully cross
 * @returns {array}
 */
export function fullfactorial (matrix) {
  return combos(unstack(matrix))
}

/**
 * Shuffles the order of the rows in the matrix. If a column/variable name
 * is specified, only the rows in this column are shuffled.
 *
 * @export
 * @param {array} matrix The matrix to be shuffles
 * @param {array} params  Array containing the variable/column to be shuffled
 * @returns {array}
 */
export function shuffleVert (matrix, params) {
  if (!isArray(params)) {
    throw new TypeError('Invalid argument specified to shuffleVert. Expects an array optionally containing column names')
  }
  if (params.length === 0) {
    return shuffle(matrix)
  } else {
    let grouped = unstack(matrix)
    let cols = pick(grouped, params)
    cols = Object.entries(cols).reduce((prev, [key, values]) => {
      prev[key] = shuffle(values)
      return prev
    }, {})
    return stack({ ...grouped, ...cols })
  }

  /** Variant 2 */
  // if (params.length === 0) {
  //   return shuffle(matrix)
  // } else if (isString(params[0]) && params[0] !== '') {
  //   const grouped = unstack(matrix)
  //   grouped[params[0]] = shuffle(grouped[params[0]])
  //   return unstack(grouped)

  // // Extract the values for the specified column
  // let colValues = Object.values(matrix).map(row => row[col])
  // // ...and shuffle them
  // colValues = shuffle(colValues)
  // // And finally place back the shuffled values into the original matrix
  // return Object.values(matrix).map((row, i) => {
  //   row[col] = colValues[i]
  //   return row
  // })
  // }
}

/**
 * Shuffles the matrix horizontally; shuffle the values of the columns
 * If column names are specified, only these will be shuffled
 *
 * @export
 * @param {array} matrix
 * @param {array} params
 * @returns {array}
 */
export function shuffleHoriz (matrix, params) {
  if (typeof params === 'undefined') params = []
  if (!isArray(params)) {
    throw new TypeError('Invalid argument specified to shuffleHoriz. Expects an array that optionally contains column names to shuffle')
  }
  return Object.values(matrix).map(row => {
    const vars = params.length === 0
      ? row
      : pick(row, params)
    const keys = Object.keys(vars)
    let vals = Object.values(vars)
    vals = shuffle(vals)
    const res = fromPairs(zip(keys, vals))
    return { ...row, ...res }
  })
}

/**
 * Sorts pnly the specified columns of the matrix
 *
 * @export
 * @param {array} matrix
 * @param {array} params
 * @returns array
 */
export function sortCol (matrix, params) {
  if (!isArray(params) || params.length !== 1) {
    throw new Error('Invalid argument specified to sortCol. Expects an array with one column name')
  }
  const grouped = unstack(matrix)
  grouped[params[0]].sort()
  return stack(grouped)
}

/**
 * Reverses the matrix order
 * If column names are specified, only their orders are reversed
 * @export
 * @param {array} matrix
 * @param {array} params
 * @returns {array}
 */
export function reverseRows (matrix, params) {
  if (typeof params === 'undefined') params = []
  if (!isArray(params)) {
    throw new TypeError('Invalid argument specified to reverseRows. Expects an array containing a column name')
  }
  if (params.length === 0) {
    return reverse(matrix)
  } else {
    let grouped = unstack(matrix)
    let cols = pick(grouped, params)
    cols = Object.entries(cols).reduce((prev, [key, values]) => {
      prev[key] = reverse(values)
      return prev
    }, {})
    return stack({ ...grouped, ...cols })
  }
}

/**
 * Rolls the matrix with the specified distance
 *
 * @export
 * @param {array} matrix
 * @param {array} params
 * @returns array
 */
export function roll (matrix, params) {
  if (!isArray(params) || params.length < 1) {
    throw new TypeError('Invalid argument passed to roll. Expects an array containing the roll distance, and and optional column name')
  }
  if (!isNumber(params[0])) {
    throw new TypeError('First argument to roll needs to be an integer')
  }
  if (params.length === 1) {
    return rollN(matrix, params[0])
  } else {
    let grouped = unstack(matrix)
    grouped[params[1]] = rollN(grouped[params[1]], params[0])
    return stack(grouped)
  }
}

/**
 * Roll array contents forward or backward by the specified amount
 *
 * @param {array} list
 * @param {int} list
 * @returns {array}
 */
function rollN (list, amount) {
  if (amount > 0) {
    for (let i = 0; i < amount; i++) {
      list.unshift(list.pop())
    }
  } else {
    for (let i = 0; i > amount; i--) {
      list.push(list.shift())
    }
  }
  return list
}

export function weight (matrix, params) {
  if (!isArray(params) || params.length !== 1) {
    throw new TypeError('Invalid argument passed to weight. Expects an array containing a column name')
  }
  const weightCol = params[0]
  return matrix.reduce((prev, item) => {
    const weight = item[weightCol]
    for (let i = 0; i < weight; i++) {
      prev.push(item)
    }
    return prev
  }, [])
}
