/** Class representing a general visual element. */
export default class BaseElement {
  /**
   * Create a log object which stores all the response data.
   * @param {Object} sketchpad - The sketchpad item that owns the visual element.
   * @param {String} script - The script containing properties of the visual element.
   * @param {Object} defaults - The default property values of the visual element.
   */
  constructor (sketchpad, script, defaults) {
    // Set class parameter properties.
    this.canvas = sketchpad.canvas
    this.defaults = defaults
    this.defaults.show_if = 'always'
    this.defaults.z_index = 0
    this.experiment = sketchpad.experiment
    this.fix_coordinates = (sketchpad.vars.uniform_coordinates === 'yes')
    this.name = sketchpad.name
    this.only_keywords = false
    this.pool = sketchpad.experiment.pool
    this.properties = {}
    this.sketchpad = sketchpad
    this.syntax = sketchpad.syntax
    this.vars = sketchpad.vars

    // Set the private properties.
    this._properties = null

    // Read the definition string.
    this.from_string(script)
  }

  /**
   * Parses the element from a definition string.
   *
   * @param {String} script The definition script line to be parsed.
   * @memberof BaseElement
   */
  from_string (script) {
    this.properties = this.sketchpad.syntax.parse_cmd(script)[2]
  }

  /**
   * Determines the drawing order of the elements.
   *
   * @returns {Number}
   * @memberof BaseElement
   */
  z_index () {
    return this.properties.z_index
  }

  /**
   * Calculate the dynamic elements within properties.
   *
   * @memberof BaseElement
   */
  eval_properties () {
    // Evaluates all properties and return them.
    const xc = this.experiment.vars.width / 2
    const yc = this.experiment.vars.height / 2

    this._properties = Object.entries(this.properties).reduce((result, [prop, val]) => {
      let value = this.syntax.eval_text(val, this.vars, false)

      if (['x', 'x1', 'x2'].includes(prop)) {
        value = Math.round(Number(value) + xc)
      }

      if (['y', 'y1', 'y2'].includes(prop)) {
        value = Math.round(Number(value) + yc)
      }

      result[prop] = value
      return result
    }, {})
  }

  /**
   * Determines whether the element should be shown, based on the show-if statement.
   *
   * @returns {Boolean} Returns true if the element must be shown.
   * @memberof BaseElement
   */
  is_shown () {
    // Set the self of the current workspace.
    this.experiment.python_workspace['self'] = this.sketchpad

    // Determines whether the element should be shown, based on the show-if statement.
    return this.experiment.python_workspace._eval(this.experiment.syntax.compile_cond(this.properties['show_if']))
  }

  /**
   * Draws the element
   *
   * @memberof BaseElement
   */
  draw () {
    // Calculate the dynamic properties.
    this.eval_properties()
  }
}
