import Widget from './widget.js'
import {
  constants
} from '../system/constants.js'

// import TextInput from 'pixi-text-input'

/**
 * Class representing an OpenSesame Image Widget.
 * @extends Widget
 */
export default class TextInputWidget extends Widget {
  /**
   * Create a widget button object which represents a text input.
   * @param {Object} form - The form  which the widget belongs.
   * @param {Object} properties - The properties belonging to the widget.
   */
  constructor (form, properties) {
    // Inherited create.
    super(form)

    // Set the class public properties.
    this.center = (typeof properties['center'] !== 'undefined') ? (properties['center'] === 'yes') : false
    this.focus = false
    this.frame = (typeof properties['frame'] !== 'undefined') ? (properties['frame'] === 'yes') : true
    this.stub = (typeof properties['stub'] !== 'undefined') ? properties['stub'] : 'Type here...'
    this.text = (typeof properties['text'] !== 'undefined') ? properties['text'] : ''
    this.var = (typeof properties['var'] !== 'undefined') ? properties['var'] : null
    this.return_accepts = (typeof properties['return_accepts'] !== 'undefined') ? (properties['return_accepts'] === 'yes') : false
    this.type = 'text_input'
  }

  /** Focus the Text area widget. */
  setFocus () {
    // Set focus toggle.
    this.focus = true
  }

  /**
   * Process the response for the text input widget.
   * @param {Object} event - The response event.
   */
  response (widget, event) {
    // Set the variable.
    widget.set_var(widget.inputField.text, widget.var)

    // Only respond to enter key.
    if ((event.keyCode === 13) && (widget.return_accepts === true)) {
      // Complete the item element.
      if (widget.form.timeout === null) {
        widget.form.item._complete()
      } else {
        widget.form.experiment._runner._events._currentItem._status = constants.STATUS_FINALIZE
      }
    }
  }

  /**
   * Draw the label widget.
   * @param {Number|String} pText - The text for the labe.
   * @param {Number|String} pHtml - Toggle if the text contains html (ignored).
   */
  draw_text (text, html) {
    const box_style = {
      fill: this.form._canvas._styles._convertColorValue(this.form.experiment.vars.background),
      rounded: 5
    }

    // PIXI - Create the text element
    const text_style = {
      fontFamily: this.form._canvas._styles.font_family,
      fontSize: this.form.experiment.vars.font_size,
      fontStyle: (this.form.experiment.vars.font_italic === 'yes') ? 'italic' : 'normal',
      fontWeight: (this.form.experiment.vars.font_bold === 'yes') ? 'bold' : 'normal',
      fill: this.form.experiment.vars.foreground
    }
    // this.inputField = new TextInput(text_style, box_style)
    // this.inputField.x = 5
    // this.inputField.y = 5
    // this.inputField.keydown = this.response
    // this.inputField.focus()
    // this._container.addChild(this.inputField)
  }

  /** General drawing method for the label widget. */
  render () {
    // Clear the old content.
    this._container.removeChildren()

    // // Draw the frame (if enabled).
    // if (this.frame === true) {
    //   this.draw_frame()
    // }

    // Draw the text.
    this.draw_text(this.text)
  }
}
