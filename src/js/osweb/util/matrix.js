/**
 * Loop utility functions
 */
import combos from 'combos'
import {
  isInteger,
  isArray,
  isPlainObject,
  isString,
  isEmpty,
  shuffle,
  zip,
  zipObject,
  fromPairs,
  pick,
  reverse
} from 'lodash'

/**
 * Group matrix values by their variables names
 *
 * @param {Object} srcMatrix The source matrix to transform
 * @returns {Object}
 */
export function unstack (srcMatrix) {
  if (!isArray(srcMatrix)) {
    throw new TypeError('srcMatrix should be an array')
  }
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
export function stack (srcMatrix) {
  if (!isPlainObject(srcMatrix)) {
    throw new TypeError('srcMatrix should be an object')
  }
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
 * @param {array} matrix The matrix to be shuffled
 * @param {array} columns  Array containing the variable/column to be shuffled
 * @returns {array}
 */
export function shuffleVert (matrix, columns) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  if (typeof (columns) === 'undefined' || (isArray(columns) && columns.length === 0)) {
    return shuffle(matrix)
  } else if (!isArray(columns)) {
    throw new TypeError('Invalid argument for columns passed to shuffleVert. Expects an array containing column names')
  } else {
    let grouped = unstack(matrix)
    let cols = pick(grouped, columns)
    cols = Object.entries(cols).reduce((prev, [key, values]) => {
      prev[key] = shuffle(values)
      return prev
    }, {})
    return stack({ ...grouped, ...cols })
  }
}

/**
 * Shuffles the matrix horizontally; shuffle the values of the columns
 * If column names are specified, only these will be shuffled
 *
 * @export
 * @param {array} matrix
 * @param {array} columns
 * @returns {array}
 */
export function shuffleHoriz (matrix, columns) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  if (typeof columns === 'undefined') columns = []
  if (!isArray(columns)) {
    throw new TypeError('Invalid argument specified to shuffleHoriz. Expects an array that optionally contains column names to shuffle')
  }
  return Object.values(matrix).map(row => {
    const vars = columns.length === 0
      ? row
      : pick(row, columns)
    const keys = Object.keys(vars)
    let vals = Object.values(vars)
    vals = shuffle(vals)
    const res = fromPairs(zip(keys, vals))
    return { ...row, ...res }
  })
}

/**
 * Sorts only the specified columns of the matrix
 *
 * @export
 * @param {array} matrix
 * @param {array} params
 * @returns array
 */
export function sortCol (matrix, col) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  if (!isString(col) || col === '') {
    throw new Error('Invalid argument specified to sortCol. Expects a column name')
  }
  const grouped = unstack(matrix)
  grouped[col].sort()
  return stack(grouped)
}

/**
 * Reverses the matrix order
 * If column names are specified, only their orders are reversed
 * @export
 * @param {array} matrix
 * @param {array} columns
 * @returns {array}
 */
export function reverseRows (matrix, columns) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  if (typeof columns === 'undefined') columns = []
  if (!isArray(columns)) {
    throw new TypeError('Invalid argument specified to reverseRows. Expects an array containing a column name')
  }
  if (columns.length === 0) {
    return reverse(matrix)
  } else {
    let grouped = unstack(matrix)
    let cols = pick(grouped, columns)
    if (isEmpty(cols)) {
      throw new ReferenceError(`one or more of ${columns} were not found in the matrix`)
    }
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
export function roll (matrix, amount, column) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  // operate on a copy of the array to preserve the original
  matrix = [...matrix]

  amount = parseInt(amount)
  if (!isInteger(amount)) {
    throw new TypeError(`amount needs to be an integer, was ${amount}`)
  }

  if (!column) {
    return rollN(matrix, amount)
  }

  if (!isString(column)) {
    throw new TypeError(`column expects a string, was ${column}`)
  } else {
    let grouped = unstack(matrix)
    if (!grouped.hasOwnProperty(column)) {
      throw new ReferenceError(`Could not find column ${column} in matrix`)
    }
    grouped[column] = rollN(grouped[column], amount)
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

/**
 * Duplicate (or remove) rows depending on the specified weight parameter
 *
 * @param {array} matrix The matrix containing the data
 * @param {string} weightCol The colom to use for weight values
 */
export function weight (matrix, weightCol) {
  if (!isArray(matrix)) {
    throw new TypeError('matrix should be of type array')
  }
  if (!isString(weightCol)) {
    throw new TypeError('Invalid argument passed to weight. Expects a column name')
  }
  if (!matrix[0].hasOwnProperty(weightCol)) {
    throw new ReferenceError(`Column '${weightCol}' not found in matrix`)
  }
  return matrix.reduce((result, item) => {
    const weight = parseInt(item[weightCol])
    if (!isInteger(weight)) {
      throw new TypeError('Specified weight value is not an integer')
    }
    for (let i = 0; i < weight; i++) {
      result.push(item)
    }
    return result
  }, [])
}
