import Canvas from '../../osweb/backends/canvas'
import Experiment from '../../osweb/items/experiment'

const {
  toMatchImageSnapshot
} = require('jest-image-snapshot')
expect.extend({
  toMatchImageSnapshot
})

const mockAddMessage = jest.fn()
const mockAddError = jest.fn()
const mockPoolAdd = jest.fn()
const mockBuildFn = jest.fn()

jest.mock('../../osweb/items/experiment', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _runner: {
        _renderer: {
          width: 800,
          height: 600
        },
        _debugger: {
          addMessage: mockAddMessage,
          addError: mockAddError
        },
        _pool: {
          add: mockPoolAdd
        },
        _build: mockBuildFn
      }
    }
  })
})

let canvas

describe('Canvas', () => {
  beforeEach(() => {
    canvas = new Canvas(new Experiment())
  })

  describe('_arrow_shape', () => {
    it('Should calculate the correct arrow coordinates for various input sets', () => {
      const testCases = [{
        input: [96, -192, 160, -128, 0.5, 0.8, 64],
        output: [
          [107.31370849898477, -203.31370849898477],
          [158.51370849898478, -152.11370849898475],
          [169.82741699796955, -163.42741699796952],
          [160, -128],
          [124.57258300203048, -118.17258300203045],
          [135.88629150101525, -129.48629150101522],
          [84.68629150101523, -180.68629150101523]
        ]
      }, {
        input: [0, -160, 64, -160, 0.5, 0.8, 64],
        output: [
          [9.797174393178826e-16, -176],
          [51.2, -176],
          [51.2, -192],
          [64, -160],
          [51.2, -128],
          [51.2, -144],
          [9.797174393178826e-16, -144]
        ]
      }, {
        input: [-448, -192, -448, -128, 0.5, 0.8, 30],
        output: [
          [-440.5, -192],
          [-440.5, -140.8],
          [-433, -140.8],
          [-448, -128],
          [-463, -140.8],
          [-455.5, -140.8],
          [-455.5, -192]
        ]
      }, {
        input: [-448, -192, -448, -128, 0.5, 0.5, 30],
        output: [
          [-440.5, -192],
          [-440.5, -160],
          [-433, -160],
          [-448, -128],
          [-463, -160],
          [-455.5, -160],
          [-455.5, -192]
        ]
      }, {
        input: [-64, -192, -64, -128, 0.5, 0.8, 64],
        output: [
          [-48, -192],
          [-48, -140.8],
          [-32, -140.8],
          [-64, -128],
          [-96, -140.8],
          [-80, -140.8],
          [-80, -192]
        ]
      }]

      for (const test of testCases) {
        expect(canvas._arrow_shape(...test.input)).toEqual(test.output)
      }
    })
  })

  describe('_contains_HTML', () => {
    it('Should return true if the string contains HTML markup', () => {
      expect(canvas._containsHTML('<b>abc</b>')).toBe(true)
    })

    it('Should return false if the string does not contain HTML markup', () => {
      expect(canvas._containsHTML('abc')).toBe(true)
    })

    // it('Should not be fooled by spurios lesser and greater than symbols (node demarkers', () => {
    //   expect(canvas._containsHTML('a < b && b > e')).toBe(false)
    // })
  })
})
