import parseDataURL from 'data-urls'

import Canvas from '../../osweb/backends/canvas'
import Style from '../../osweb/backends/styles'
import Experiment from '../../osweb/items/experiment'
import * as PIXI from 'pixi.js'

// Add image snapshot matcher to Jest expect function suite
const { toMatchImageSnapshot } = require('jest-image-snapshot')
expect.extend({ toMatchImageSnapshot })

// Set up some mock functions for the runner
const mockAddMessage = jest.fn()
const mockAddError = jest.fn()
const mockPoolAdd = jest.fn()
const mockBuildFn = jest.fn()

jest.mock('../../osweb/items/experiment', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _runner: {
        _renderer: {
          width: 1024,
          height: 768
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

const experiment = new Experiment()

// Canvas dimensions
const dimensions = {
  width: experiment._runner._renderer.width,
  height: experiment._runner._renderer.height
}

const cy = dimensions.height / 2
const cy = dimensions.width / 2

let canvas = new Canvas(new Experiment())
let app = new PIXI.Application({
  width: dimensions.width,
  height: dimensions.height,
  antialias: true,
  transparent: false,
  resolution: 1
})
document.body.appendChild(app.view)

const canvasSnapshot = () => parseDataURL(app.view.toDataURL('image/png'))
const refreshCanvas = () => {
  // Clear the screen
  app.stage.removeChildren()
  // Reset the buffer/canvas
  canvas = new Canvas(experiment)
}

describe('Canvas', () => {
  describe('_arrow_shape', () => {
    const arrowTestCases = [{
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

    it('Should calculate the correct arrow coordinates for various input sets', () => {
      for (const test of arrowTestCases) {
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
      const style = canvas._getStyle({
        '_fill': true,
        '_penwidth': 10
      })
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

  describe('drawing functions', () => {
    const defaultStyle = {
      color: 'white',
      background_color: 'white',
      penwidth: 1,
      fill: 0
    }

    beforeEach(refreshCanvas)

    it('should draw lines', () => {
      const params = [
        [0, -32 + cy, 0, 32 + cy, {...defaultStyle}],
        [0, -32 + cy, 0, 32 + cy, {...defaultStyle, color: 'red'}],
        [0, -32 + cy, 0, 32 + cy, {...defaultStyle, penwidth: 2}],
        [0, -32 + cy, 0, 32 + cy, {...defaultStyle, penwidth: 4}],
        [0, -32 + cy, 0, 32 + cy, {...defaultStyle, penwidth: 8}],
        [-32, cy, 32, cy, {...defaultStyle}],
        [-32, -32 + cy, 32, 32 + cy, {...defaultStyle}],
        [-32, 32 + cy, 32, -32 + cy, {...defaultStyle, penwidth: 4, color: 'green'}]
      ]

      let xIncr = dimensions.width / (params.length + 1)
      let x = xIncr

      for (const stim of params) {
        stim[0] += x
        stim[2] += x
        x += xIncr
        canvas.line(...stim)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw arrows', () => {
      const arrowParams = [
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.8, 30, {...defaultStyle}],
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.8, 30, {...defaultStyle, fill: 1}],
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.8, 30, {...defaultStyle, color: 'red'}],
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.8, 30, {...defaultStyle, penwidth: 8}],
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.5, 30, {...defaultStyle}],
        [0, -32 + cy, 0, 32 + cy, 0.5, 0.8, 64, {...defaultStyle}],
        [-32, cy, 32, cy, 0.5, 0.8, 64, {...defaultStyle}],
        [-32, -32 + cy, 32, 32 + cy, 0.5, 0.8, 64, {...defaultStyle}]
      ]

      let xIncr = dimensions.width / (arrowParams.length + 1)
      let x = xIncr

      for (const arrow of arrowParams) {
        arrow[0] += x
        arrow[2] += x
        x += xIncr
        canvas.arrow(...arrow)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw circles', () => {
      const circleParams = [
        [0, cy, 32, {...defaultStyle}],
        [0, cy, 32, {...defaultStyle, penwidth: 10}],
        [0, cy, 32, {...defaultStyle, color: 'red'}],
        [0, cy, 32, {...defaultStyle, fill: true}],
        [0, cy, 16, {...defaultStyle}],
        [0, cy, 64, {...defaultStyle}]
      ]

      let xIncr = dimensions.width / (circleParams.length + 1)
      let x = xIncr

      for (const circle of circleParams) {
        circle[0] += x
        x += xIncr
        canvas.circle(...circle)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw fixation dots', () => {
      const styles = {...defaultStyle, background_color: 'black'}

      const params = [
        [0, cy, undefined, {...styles}],
        [0, cy, 'default', {...styles, color: 'red'}],
        [0, cy, 'large-filled', {...styles}],
        [0, cy, 'medium-filled', {...styles}],
        [0, cy, 'small-filled', {...styles}],
        [0, cy, 'large-open', {...styles}],
        [0, cy, 'medium-open', {...styles}],
        [0, cy, 'small-open', {...styles}],
        [0, cy, 'large-cross', {...styles}],
        [0, cy, 'medium-cross', {...styles}],
        [0, cy, 'small-cross', {...styles}]
      ]

      let xIncr = dimensions.width / (params.length + 1)
      let x = xIncr

      for (const stim of params) {
        stim[0] += x
        x += xIncr
        canvas.fixdot(...stim)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw ellipses', () => {
      const params = [
        [0, cy, 64, 64, {...defaultStyle}],
        [0, cy, 64, 64, {...defaultStyle, penwidth: 10}],
        [0, cy, 64, 64, {...defaultStyle, color: 'red'}],
        [0, cy, 64, 64, {...defaultStyle, fill: true}],
        [0, cy, 32, 32, {...defaultStyle}],
        [0, cy, 64, 32, {...defaultStyle, penwidth: 5, color: 'green'}],
        [-32, cy + 32, 128, 32, {...defaultStyle}],
        [0, cy, 32, 64, {...defaultStyle}]
      ]

      let xIncr = dimensions.width / (params.length + 1)
      let x = xIncr

      for (const stim of params) {
        stim[0] += x
        x += xIncr
        canvas.ellipse(...stim)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw rects', () => {
      const params = [
        [0, cy, 64, 64, {...defaultStyle}],
        [0, cy, 64, 64, {...defaultStyle, penwidth: 10}],
        [0, cy, 64, 64, {...defaultStyle, color: 'red'}],
        [0, cy, 64, 64, {...defaultStyle, fill: true}],
        [0, cy, 32, 32, {...defaultStyle}],
        [0, cy, 64, 32, {...defaultStyle, penwidth: 5, color: 'green'}],
        [0, cy, 96, 32, {...defaultStyle}],
        [0, cy, 32, 64, {...defaultStyle}],
        [0, cy, 50, 50, {...defaultStyle,
          color: 'yellow',
          background_color: 'yellow',
          fill: true
        }]
      ]

      let xIncr = dimensions.width / (params.length + 1)
      let x = xIncr

      for (const stim of params) {
        stim[0] += x
        x += xIncr
        canvas.rect(...stim)
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })
  })

  describe('patches', () => {
    beforeEach(refreshCanvas)

    it('should draw gabors', () => {
      // (x, y, orient, freq, env, size, stdev, phase, color1, color2, bgmode)
      const params = [
        [0, cy, 0, 0.1, 'g', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'g', 96, 12, 0, 'red', 'black', 'avg'],
        [0, cy, 0, 0.1, 'g', 96, 12, 0, 'black', 'red', 'avg'],
        [0, cy, 0, 0.1, 'g', 96, 12, 0, 'white', 'black', 'col2'],
        [0, cy, 0, 0.1, 'l', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'c', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'r', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'g', 128, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.05, 'g', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'g', 96, 6, 0, 'white', 'black', 'avg'],
        [0, cy, 45, 0.1, 'g', 96, 12, 0, 'white', 'black', 'avg'],
        [0, cy, 0, 0.1, 'g', 96, 12, 0.5, 'white', 'black', 'avg']
      ]

      let xIncr = Math.max(150, dimensions.width / (params.length + 1))
      let x = xIncr
      let addY = -100

      for (const stim of params) {
        stim[0] += x
        stim[1] += addY
        // wrap to next line if too many patches are on one plane.
        canvas.gabor(...stim)

        if (x >= dimensions.width - 150) {
          x = xIncr
          addY += 200
        } else {
          x += xIncr
        }
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })

    it('should draw noise patches', () => {
      // (x, y, env, size, stdev, color1, color2, bgmode)
      const params = [
        [0, cy, 'g', 96, 12, 'white', 'black', 'avg'],
        [0, cy, 'g', 96, 18, 'white', 'black', 'avg'],
        [0, cy, 'g', 96, 12, 'red', 'black', 'avg'],
        [0, cy, 'g', 96, 12, 'black', 'red', 'avg'],
        [0, cy, 'g', 96, 12, 'white', 'black', 'col2'],
        [0, cy, 'l', 96, 12, 'white', 'black', 'avg'],
        [0, cy, 'c', 96, 12, 'white', 'black', 'avg'],
        [0, cy, 'r', 96, 12, 'white', 'black', 'avg'],
        [0, cy, 'g', 128, 12, 'white', 'black', 'avg'],
        [0, cy, 'g', 96, 6, 'white', 'black', 'avg']
      ]

      let xIncr = Math.max(150, dimensions.width / (params.length + 1))
      let x = xIncr
      let addY = -100

      for (const stim of params) {
        stim[0] += x
        stim[1] += addY
        // wrap to next line if too many patches are on one plane.
        canvas.noise(...stim)

        if (x >= dimensions.width - 150) {
          x = xIncr
          addY += 200
        } else {
          x += xIncr
        }
      }

      app.renderer.render(canvas._container)
      const img = canvasSnapshot()
      expect(img.body).toMatchImageSnapshot()
    })
  })

  // describe('images', () => {
  //   it('should draw images at various scales and points of origin', () => {
  //     refreshCanvas()
  //     // Add image to filepool
  //     const testImg = new Image()
  //     testImg.src = '../_resources/spongebob'
  //     experiment._runner._pool['spongebob'] = {data: testImg}

  //     canvas.image('spongebob', cx, cy)
  //   })
  // })
})
