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

import _ from 'lodash'

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

  describe('shuffleVert()', () => {
    it('should throw an exception when something other than an array is passed for the columns argument', () => {
      expect(() => shuffleVert(srcMatrix, 'aaa')).toThrow()
    })

    it('should shuffle the rows of the entire matrix with no argument for columns', () => {
      const shuffleSpy = jest.spyOn(_, 'shuffle')
      const result = shuffleVert(srcMatrix)
      expect(shuffleSpy).toHaveBeenCalled()
    })
  })

  describe('shuffleHoriz()', () => {

  })

  describe('sortCol()', () => {

  })

  describe('reverseRows()', () => {

  })
  describe('roll()', () => {

  })
  describe('weight()', () => {

  })
})
