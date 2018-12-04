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
  mockShuffle()
  return a
})

const mockPick = jest.fn()
jest.mock('lodash/pick', () => a => {
  mockPick()
  return a
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

    it('should throw an exception when something other than an array is passed for the columns argument', () => {
      expect(() => shuffleVert(srcMatrix, 'aaa')).toThrow()
      expect(() => shuffleVert(srcMatrix, 2)).toThrow()
      expect(() => shuffleVert(srcMatrix, true)).toThrow()
      expect(() => shuffleVert(srcMatrix, {})).toThrow()
      expect(() => shuffleHoriz(srcMatrix, 'aaa')).toThrow()
      expect(() => shuffleHoriz(srcMatrix, 2)).toThrow()
      expect(() => shuffleHoriz(srcMatrix, true)).toThrow()
      expect(() => shuffleHoriz(srcMatrix, {})).toThrow()
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
      expect(mockShuffle).toHaveBeenCalledTimes(5)
      expect(mockPick).toHaveBeenCalledTimes(4)
    })
  })

  describe('sortCol', () => {
    it('should throw an error if something else is passed for column than a string', () => {
      expect(() => sortCol(srcMatrix, '')).toThrow()
      expect(() => sortCol(srcMatrix, 2)).toThrow()
      expect(() => sortCol(srcMatrix, [])).toThrow()
      expect(() => sortCol(srcMatrix, {})).toThrow()
      expect(() => sortCol(srcMatrix, true)).toThrow()
    })

    it('should sort the specified column in the matrix', () => {
      expect(sortCol(srcMatrix, 'word')).toEqual([
        { number: 1, word: 'one' },
        { number: 2, word: 'three' },
        { number: 3, word: 'two' }
      ])
    })
  })

  describe('reverseRows', () => {
    it('should throw an error if something other than an array is passed for the column argument', () => {
      expect(() => reverseRows(srcMatrix, 'aaa')).toThrow()
      expect(() => reverseRows(srcMatrix, 2)).toThrow()
      expect(() => reverseRows(srcMatrix, true)).toThrow()
      expect(() => reverseRows(srcMatrix, {})).toThrow()
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
      console.log(srcMatrix)
      console.log(reversed)
      expect(reversed).toEqual([
        { number: 1, word: 'three' },
        { number: 2, word: 'two' },
        { number: 3, word: 'one' }
      ])
    })
  })

  describe('roll()', () => {

  })

  describe('weight()', () => {

  })
})
