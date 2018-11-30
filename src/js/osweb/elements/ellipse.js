import BaseElement from './base_element.js'
import Styles from '../backends/styles.js'

/**
 * Class representing an arrow element.
 * @extends BaseElement
 */
export default class Ellipse extends BaseElement {
  /**
   * Create an experiment item which controls the OpenSesame experiment.
   * @param {Object} sketchpad - The sketchpad item that owns the visual element.
   * @param {String} script - The script containing properties of the visual element.
   */
  constructor (sketchpad, script) {
    // Create a default property container.
    const defaults = {
      fill: 1,
      color: sketchpad.vars.get('foreground'),
      penwidth: 1,
      x: null,
      y: null,
      w: null,
      h: null
    }

    // Inherited.
    super(sketchpad, script, defaults)
  }

  /** Implements the draw phase of an element. */
  draw () {
    // Inherited.
    super.draw()

    // Create a styles object containing style information
    var styles = new Styles()
    styles.background_color = this._properties.color
    styles.color = this._properties.color
    styles.fill = this._properties.fill
    styles.penwidth = this._properties.penwidth

    // Draw the ellipse element to the canvas of the sketchpad.
    this.sketchpad.canvas.ellipse(Number(this._properties.x),
      Number(this._properties.y), Number(this._properties.w),
      Number(this._properties.h), styles)
  }
}
