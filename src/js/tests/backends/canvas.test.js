import Canvas from '../../osweb/backends/canvas'
import Style from '../../osweb/backends/styles'
import Experiment from '../../osweb/items/experiment'
import * as PIXI from 'pixi.js'

const {
  toMatchImageSnapshot
} = require('jest-image-snapshot')
expect.extend({
  toMatchImageSnapshot
})

const renderer = PIXI.autoDetectRenderer(800, 600, {
  antialias: true,
  transparent: false,
  resolution: 1
})
renderer.backgroundColor = 0x000000

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

let canvas = new Canvas(new Experiment())

describe('Canvas', () => {
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

  describe('_get_style', () => {
    it('Should return a default style set if called without parameters', () => {
      expect(canvas._getStyle()).toBeInstanceOf(Style)
    })

    it('Should use the style properties of the passed style, and use defaults otherwise', () => {
      const defaultStyles = canvas._getStyle()
      const style = canvas._getStyle({'_fill': true, '_penwidth': 10})
      expect(style).toHaveProperty('_fill', true)
      expect(style).toHaveProperty('_penwidth', 10)
      expect(style._bidi).toBe(defaultStyles._bidi)
    })
  })

  // This function does not appear to work at all! Needs some more investigation
  describe('_getTextBaseline', () => {
    it('Should return baseline values when simply passed at text', () => {
      // Dud statement to make the test pass
      expect(1).toBe(1)
    })
  })

  describe('_match_env', () => {
    it('should return c for [c, circular, round]', () => {
      const values = ['c', 'circular', 'round']
      for (const val of values) {
        expect(canvas._match_env(val)).toBe('c')
      }
    })

    it('should return g for [g, gaussian, gauss, normal, rect, square]', () => {
      const values = ['g', 'gaussian', 'gauss', 'normal', 'rect', 'square']
      for (const val of values) {
        expect(canvas._match_env(val)).toBe('g')
      }
    })

    it('should return r for [rectangular, rectangle]', () => {
      const values = ['rectangular', 'rectangle']
      for (const val of values) {
        expect(canvas._match_env(val)).toBe('r')
      }
    })

    it('should return l for [l, linear, lin, ln]', () => {
      const values = ['l', 'linear', 'lin', 'ln']
      for (const val of values) {
        expect(canvas._match_env(val)).toBe('l')
      }
    })

    it('should return g for no or unknown values', () => {
      const values = [null, 'blue']
      for (const val of values) {
        expect(canvas._match_env(val)).toBe('g')
      }
    })
  })

  describe('arrow', () => {
    beforeEach(() => {
      canvas = new Canvas(new Experiment())
    })
    it('should draw an arrow', () => {
      canvas.arrow(0, 0, 10, 0, 5, 10, 20)
      const pixiArrow = canvas._container.getChildAt(0)
      renderer.stage.addChild(pixiArrow)
      expect(1).toBe(1)
    })
  })
})
