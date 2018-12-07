import {
  stack,
  unstack,
  fullfactorial,
  shuffleVert,
  shuffleHoriz,
  sortCol,
  reverseRows,
  roll,
  weight
} from '../../osweb/util/matrix'

/** Generate a mock functions to spy on lodash */
const mockShuffle = jest.fn()
jest.mock('lodash/shuffle', () => a => {
  const shuffle = jest.requireActual('lodash/shuffle')
  mockShuffle()
  return shuffle(a)
})

const mockPick = jest.fn()
jest.mock('lodash/pick', () => (a, b) => {
  const pick = jest.requireActual('lodash/pick')
  mockPick()
  return pick(a, b)
})

describe('Matrix functions', () => {
  let srcMatrix
  beforeEach(() => {
    srcMatrix = [
      { number: 1, word: 'one' },
      { number: 2, word: 'two' },
      { number: 3, word: 'three' }
    ]
  })

  describe('stack() and unstack()', () => {
    let unstackedMatrix = {
      'number': [1, 2, 3],
      'word': ['one', 'two', 'three']
    }

    it('should unstack/transpose the matrix', () => {
      expect(unstack(srcMatrix)).toEqual(unstackedMatrix)
    })

    it('should construct the original matrix from an unstacked one', () => {
      expect(stack(unstackedMatrix)).toEqual(srcMatrix)
    })

    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', []]) {
        expect(() => stack(arg)).toThrow()
      }
      for (let arg of [5, '5', {}]) {
        expect(() => unstack(arg)).toThrow()
      }
    })
  })

  describe('fullfactorial()', () => {
    it('should create a fully factorial crossed version of the matrix', () => {
      expect(fullfactorial(srcMatrix)).toEqual([
        { number: 1, word: 'one' },
        { number: 2, word: 'one' },
        { number: 3, word: 'one' },
        { number: 1, word: 'two' },
        { number: 2, word: 'two' },
        { number: 3, word: 'two' },
        { number: 1, word: 'three' },
        { number: 2, word: 'three' },
        { number: 3, word: 'three' }
      ])
    })
  })

  describe('Randomization', () => {
    beforeEach(() => {
      mockShuffle.mockClear()
      mockPick.mockClear()
    })

    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', true, {}]) {
        expect(() => shuffleVert(arg)).toThrow()
        expect(() => shuffleHoriz(arg)).toThrow()
      }
    })

    it('should throw an exception when something other than an array is passed for the columns argument', () => {
      for (let arg of [5, 'aaa', true, {}]) {
        expect(() => shuffleVert(srcMatrix, arg)).toThrow()
        expect(() => shuffleHoriz(srcMatrix, arg)).toThrow()
      }
    })

    it('should shuffle the rows of the entire matrix with no argument for columns', () => {
      shuffleVert(srcMatrix)
      shuffleHoriz(srcMatrix)
      // 4 is weird, but seems correct.
      // It appears the shuffle function calls itself recursively
      expect(mockShuffle).toHaveBeenCalledTimes(4)
    })

    it('should only shuffle the rows of columns that were specified', () => {
      shuffleVert(srcMatrix, ['word'])
      shuffleHoriz(srcMatrix, ['word'])
      expect(mockShuffle).toHaveBeenCalledTimes(4)
      expect(mockPick).toHaveBeenCalledTimes(4)
    })
  })

  describe('sortCol', () => {
    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', true, {}]) {
        expect(() => sortCol(arg)).toThrow()
      }
    })

    it('should throw an error if something else is passed for column than a string', () => {
      for (let arg of [5, true, [], {}, '']) {
        expect(() => sortCol(srcMatrix, arg)).toThrow()
      }
    })

    it('should only sort the specified column in the matrix', () => {
      expect(sortCol(srcMatrix, 'word')).toEqual([
        { number: 1, word: 'one' },
        { number: 2, word: 'three' },
        { number: 3, word: 'two' }
      ])
    })
  })

  describe('reverseRows', () => {
    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', true, {}]) {
        expect(() => reverseRows(arg)).toThrow()
      }
    })

    it('should throw an error if something other than an array is passed for the column argument', () => {
      for (let arg of ['aa', 2, true, {}]) {
        expect(() => reverseRows(srcMatrix, arg)).toThrow()
      }
    })

    it('should reverse all rows if no column name is specified', () => {
      expect(reverseRows(srcMatrix)).toEqual([
        { number: 3, word: 'three' },
        { number: 2, word: 'two' },
        { number: 1, word: 'one' }
      ])
    })

    it('should only reverse the rows of the column name that is specified', () => {
      const reversed = reverseRows(srcMatrix, ['word'])
      expect(reversed).toEqual([
        { number: 1, word: 'three' },
        { number: 2, word: 'two' },
        { number: 3, word: 'one' }
      ])
    })
  })

  describe('roll()', () => {
    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', true, {}]) {
        expect(() => roll(arg)).toThrow()
      }
    })

    it('should throw an error if something other than an integer is passed for the amount argument', () => {
      for (let arg of ['aaa', true, {}, []]) {
        expect(() => roll(srcMatrix, arg)).toThrow()
      }
    })

    it('should throw an error if something other than a string is passed for the column argument', () => {
      for (let arg of [5, [], true, {}]) {
        expect(() => roll(srcMatrix, 2, arg)).toThrow()
      }
    })

    it('should roll the matrix forward or backward by the specified amount', () => {
      expect(roll(srcMatrix, 1)).toEqual([
        { number: 3, word: 'three' },
        { number: 1, word: 'one' },
        { number: 2, word: 'two' }
      ])

      expect(roll(srcMatrix, -1)).toEqual([
        { number: 2, word: 'two' },
        { number: 3, word: 'three' },
        { number: 1, word: 'one' }
      ])

      expect(roll(srcMatrix, srcMatrix.length)).toEqual(srcMatrix)
      expect(roll(srcMatrix, -srcMatrix.length)).toEqual(srcMatrix)
    })

    it('should throw an error if the specified column is not found', () => {
      expect(() => roll(srcMatrix, 2, 'imaginary')).toThrow()
    })

    it('should only roll the values of the specified column', () => {
      expect(roll(srcMatrix, 1, 'word')).toEqual([
        { number: 1, word: 'three' },
        { number: 2, word: 'one' },
        { number: 3, word: 'two' }
      ])

      expect(roll(srcMatrix, -1, 'number')).toEqual([
        { number: 2, word: 'one' },
        { number: 3, word: 'two' },
        { number: 1, word: 'three' }
      ])

      expect(roll(srcMatrix, srcMatrix.length, 'number')).toEqual(srcMatrix)
      expect(roll(srcMatrix, -srcMatrix.length, 'number')).toEqual(srcMatrix)
    })
  })

  describe('weight()', () => {
    it('should throw an error if the wrong datatype is passed for matrix', () => {
      for (let arg of [5, '5', true, {}]) {
        expect(() => weight(arg)).toThrow()
      }
    })

    it('should throw an error if something other than a string is passed as the second argument', () => {
      for (let arg of [true, {}, []]) {
        expect(() => weight(srcMatrix, arg)).toThrow()
      }
    })

    it('should throw an error if the weight column is not found in the matrix', () => {
      expect(() => weight(srcMatrix, 'aaa')).toThrow(`Column 'aaa' not found in matrix`)
    })

    it('should remove items with weight 0', () => {
      srcMatrix[0].w = 0
      srcMatrix[1].w = 1
      srcMatrix[2].w = 1
      expect(weight(srcMatrix, 'w')).toEqual([
        { number: 2, word: 'two', w: 1 },
        { number: 3, word: 'three', w: 1 }
      ])
    })

    it('should duplicate items by their designated weight', () => {
      srcMatrix[0].w = 1
      srcMatrix[1].w = 2
      srcMatrix[2].w = 1
      expect(weight(srcMatrix, 'w')).toEqual([
        { number: 1, word: 'one', w: 1 },
        { number: 2, word: 'two', w: 2 },
        { number: 2, word: 'two', w: 2 },
        { number: 3, word: 'three', w: 1 }
      ])
    })

    it('should throw an error when a weight value is missing', () => {
      srcMatrix[1].w = 2
      expect(() => weight(srcMatrix, 'w')).toThrow()
    })

    it('should throw an error when a weight value is not an int', () => {
      srcMatrix[0].w = 'an apple a day...'
      expect(() => weight(srcMatrix, 'w')).toThrow()
    })
  })
})
