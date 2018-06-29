import * as PIXI from 'pixi.js'
import Styles from './styles.js'

/** Class representing a drawing canvas. */
export default class Canvas {
  /**
   * Create a canvas object which is used to show all visual stimuli.
   * @param {Object} experiment - The experiment to which the canvas belongs.
   * @param {Boolean} auto_prepare - If true the canvas is prepared after drawing.
   * @param {Object} style_args - Optional styling argument for the canvas.
   */
  constructor (experiment, auto_prepare) {
    // Create and set public properties.
    this.auto_prepare = (typeof auto_prepare === 'undefined') ? true : auto_prepare // Set autoprepare toggle (not supported yet).
    this.experiment = experiment // Anchor to the experiment object.

    // Create and set private properties.
    this._container = new PIXI.Container() // PIXI - Create the container which represents the canvas.
    this._font_string = 'bold 18px Courier New' // Default font definition string.
    this._height = this.experiment._runner._renderer.height // Height of the HTML canvas used for drawing.
    this._styles = new Styles() // The style container.
    this._width = this.experiment._runner._renderer.width // Width of the HTML canvas used for drawing.
  }

  /**
   * Calculate the coordinates for the arraw shape.
   * @param {Number} sx - The starting x coordinate of the element.
   * @param {Number} sy - The starting y coordinate of the element.
   * @param {Number} ex - The ending x coordinate of the element.
   * @param {Number} ey - The ending y coordinate of the element.
   * @param {Number} bodyWidth - The width of the element body.
   * @param {Number} bodyLength - The height of the element body.
   * @param {Number} headWidth - The width of the element head.
   * @return {Array} - The coordinates defining the arrow element.
   */
  _arrow_shape (sx, sy, ex, ey, bodyWidth, bodyLength, headWidth) {
    // Length
    var d = Math.sqrt(Math.pow(ey - sy, 2) + Math.pow(sx - ex, 2))
    var angle = Math.atan2(ey - sy, ex - sx)
    var _headWidth = (1 - bodyWidth) / 2.0
    bodyWidth = bodyWidth / 2.0

    // calculate coordinates
    var p4 = [ex, ey]
    var p1 = [sx + bodyWidth * headWidth * Math.cos(angle - Math.PI / 2), sy + bodyWidth * headWidth * Math.sin(angle - Math.PI / 2)]
    var p2 = [p1[0] + bodyLength * Math.cos(angle) * d, p1[1] + bodyLength * Math.sin(angle) * d]
    var p3 = [p2[0] + _headWidth * headWidth * Math.cos(angle - Math.PI / 2), p2[1] + _headWidth * headWidth * Math.sin(angle - Math.PI / 2)]
    var p7 = [sx + bodyWidth * headWidth * Math.cos(angle + Math.PI / 2), sy + bodyWidth * headWidth * Math.sin(angle + Math.PI / 2)]
    var p6 = [p7[0] + bodyLength * Math.cos(angle) * d, p7[1] + bodyLength * Math.sin(angle) * d]
    var p5 = [p6[0] + _headWidth * headWidth * Math.cos(angle + Math.PI / 2), p6[1] + _headWidth * headWidth * Math.sin(angle + Math.PI / 2)]

    return [p1, p2, p3, p4, p5, p6, p7]
  }

  /**
   * Checks if the supplied string contains HTML markup.
   * @param {String} str - The string to check.
   * @return {Boolean} - True if HTML markup was found, false if not.
   */
  _containsHTML (str) {
    let doc
    try {
      doc = new DOMParser().parseFromString(str, 'text/html')
      return Array.from(doc.childNodes).some(node => node.nodeType === 1)
    } catch (e) {
      console.error('Could not parse DOM: ' + e.message)
    }
  }

  /** Exit the display and return to default settings. */
  _exitDisplay () {
    // Clear container.
    this.clear()

    // Set the cursor visibility to default (visible).
    this.experiment._runner._renderer.view.style.cursor = 'default'

    // PIXI: Set the renderer dimensions.
    this.experiment._runner._renderer.resize(800, 600)

    // Clear the renderer.
    this.experiment._runner._renderer.backgroundColor = 0x000000
    this.experiment._runner._renderer.clear()
    this.experiment._runner._renderer.render(this._container)
  }

  /**
   * Checks if addiotional style is defined otherwise use default.
   * @param {Object} styleArgs - The additional style.
   * @return {Object} - returns a style object.
   */
  _getStyle (styleArgs) {
    // Check if the supplied style does exist.
    if (typeof (styleArgs) === 'undefined') {
      return this._styles
    } else {
      const styles = new Styles()
      // Shorter notation: (but keeping old code in comments if this does not work as expected)
      Object.assign(styles, styleArgs)
      // styles._background_color = (typeof (styleArgs._background_color) !== 'undefined') ? styleArgs._background_color : 0x000000
      // styles._bidi = (typeof (styleArgs._bidi) !== 'undefined') ? styleArgs._bidi : false
      // styles._color = (typeof (styleArgs._color) !== 'undefined') ? styleArgs._color : 0xffffff
      // styles._fill = (typeof (styleArgs._fill) !== 'undefined') ? styleArgs._fill : false
      // styles._font_bold = (typeof (styleArgs._font_bold) !== 'undefined') ? styleArgs._font_bold : true
      // styles._font_family = (typeof (styleArgs._font_family) !== 'undefined') ? styleArgs._font_family : 'Arial'
      // styles._font_italic = (typeof (styleArgs._font_italic) !== 'undefined') ? styleArgs._font_italic : false
      // styles._font_size = (typeof (styleArgs._font_size) !== 'undefined') ? styleArgs._font_size : 24
      // styles._font_underline = (typeof (styleArgs._font_underline) !== 'undefined') ? styleArgs._font_underline : false
      // styles._penwidth = (typeof (styleArgs._penwidth) !== 'undefined') ? styleArgs._penwidth : 1
      return styles
    }
  }

  /**
   * Calculates the height, ascent en descent in pixels for the given font.
   * @param {String} textLine The line of text.
   * @param {String} fontFamily The font family to use.
   * @param {Number} fontSize The size of the font.
   * @return {Object} object containing the height, ascent en descent of the text.
   */
  _getTextBaseline (textLine, fontFamily, fontSize, fontBold) {
    // Create the text element.
    const text = document.createElement('span')
    text.style.fontFamily = fontFamily || 'Arial'
    text.style.fontWeight = (fontBold === true) ? 'bold' : 'normal'
    text.style.fontSize = String(fontSize) + 'px'
    text.innerHTML = textLine
    // Create the calculation div.
    const block = document.createElement('div')
    block.style.display = 'inline-block'
    block.style.lineHeight = 'normal'
    // block.style.width = '1px'
    // block.style.height = '0px'
    // Create the container div.
    const div = document.createElement('div')
    div.append(text, block)
    document.body.appendChild(div)

    // Set the variables.
    const result = {}
    let rect
    let top1
    let top2

    // Calculate the ascent
    block.style.verticalAlign = 'baseline'
    rect = block.getBoundingClientRect()
    top1 = rect.top + document.body.scrollTop
    rect = text.getBoundingClientRect()
    top2 = rect.top + document.body.scrollTop
    result.ascent = Math.round(top1 - top2)

    // Calculate the descent and the heigt.
    block.style.verticalAlign = 'bottom'
    rect = block.getBoundingClientRect()
    top1 = rect.top + document.body.scrollTop
    rect = text.getBoundingClientRect()
    top2 = rect.top + document.body.scrollTop
    result.height = Math.round(top1 - top2)
    result.descent = result.height - result.ascent

    document.body.removeChild(div)

    // Return the result.
    return result
  }

  /**
   * Returns the correct envelop setting to use.
   * @param {String} env - Envelop parameter.
   * @return {String} - The envelop type to use.
   */
  _match_env (env) {
    if (['c', 'circular', 'round'].includes(env)) {
      return 'c'
    } else if (['g', 'gaussian', 'gauss', 'normal', 'rect', 'square'].includes(env)) {
      return 'g'
    } else if (['rectangular', 'rectangle'].includes(env)) {
      return 'r'
    } else if (['l', 'linear', 'lin', 'ln'].includes(env)) {
      return 'l'
    } else {
      return 'g'
    }
  }

  /**
   * Parse recursively a HTML based text area and returns a set of text elements.
   * @param {Object} htmlNode - The html node to process.
   * @param {Object} textBlock - Object containing the translated text block.
   * @param {Object} currentStyle - Object containing the current style to use.
   */
  _parseHtmlNode (htmlNode, textBlock, currentStyle) {
    // Create a style for the current leven
    var elementStyle = this._getStyle(currentStyle)

    // Process the node content itself.
    switch (htmlNode.nodeType) {
      case 1:
        // Select the proper html tag
        switch (htmlNode.nodeName) {
          case 'B':
            // Process bold tag.
            elementStyle.font_bold = true
            break
          case 'BR':
            // Process break tag, get the total width of the line.
            textBlock.row.height = (textBlock.row.height > 0) ? textBlock.row.height : textBlock.prev_height
            textBlock.row.width = (textBlock.x_pos > textBlock.row.width) ? textBlock.x_pos : textBlock.row.width
            textBlock.width = (textBlock.width > textBlock.row.width) ? textBlock.width : textBlock.row.width
            textBlock.y_pos = textBlock.y_pos + textBlock.row.height
            textBlock.x_pos = 4
            textBlock.height = textBlock.height + textBlock.row.height
            // new row with elements.
            textBlock.rows.push(textBlock.row)
            textBlock.row = {
              ascent: 0,
              width: 0,
              height: 0,
              text_elements: [],
              text_dimensions: [],
              text_underline: []
            }
            break
          case 'I':
            // Process italic tag.
            elementStyle.font_italic = true
            break
          case 'SPAN':
            // Get the style tokens.
            if (htmlNode.attributes.length > 0) {
              var tokens = htmlNode.attributes[0].value.split(';')
              // parse through the style tokens.
              for (var j = 0; j < tokens.length; j++) {
                var property = tokens[j].slice(0, tokens[j].indexOf(':'))
                var value = tokens[j].slice(tokens[j].indexOf(':') + 1, tokens[j].length)
                // Set the supported properties.
                switch (property) {
                  case 'color':
                    elementStyle.color = value
                    break
                  case 'font-size':
                    elementStyle.font_size = value
                    break
                  case 'font-family':
                    elementStyle.font_family = value
                    break
                }
              }
            }
            break
          case 'U':
            // Process underline tag.
            elementStyle.font_underline = true
            break
        }
        break
      case 3:
        // PIXI - Create the text style element.
        var textStyle = {
          fontFamily: elementStyle.font_family,
          fontStyle: (elementStyle.font_italic === true) ? 'italic' : 'normal',
          fontWeight: (elementStyle.font_bold === true) ? 'bold' : 'normal',
          fontSize: elementStyle.font_size,
          fill: elementStyle.color
        }

        // Create the text element and get the dimension.
        var bounds = {}
        var textElement = new PIXI.Text(htmlNode.textContent, textStyle)
        textElement.getBounds(false, bounds)

        // Get the height and descent (for vertical positioning);
        var dimension = this._getTextBaseline(htmlNode.textContent, elementStyle.font_family, elementStyle.font_size, elementStyle.font_bold)

        // Position the text element and update the width.
        textElement.x = textBlock.x_pos
        textElement.y = textBlock.y_pos
        textBlock.x_pos = textBlock.x_pos + bounds.width
        textBlock.row.width = (textBlock.x_pos > textBlock.row.width) ? textBlock.x_pos : textBlock.row.width
        textBlock.width = (textBlock.width > textBlock.row.width) ? textBlock.width : textBlock.row.width
        textBlock.row.height = ((bounds.height + 1) > textBlock.row.height) ? bounds.height + 1 : textBlock.row.height
        textBlock.row.ascent = (dimension.ascent > textBlock.row.ascent) ? dimension.ascent : textBlock.row.ascent
        textBlock.prev_height = textBlock.row.height
        textBlock.row.text_elements.push(textElement)
        textBlock.row.text_dimensions.push(dimension)
        textBlock.row.text_underline.push(elementStyle.font_underline)
        break
    }

    // Process the child nodes recursive (if any).
    for (var i = 0; i < htmlNode.childNodes.length; i++) {
      this._parseHtmlNode(htmlNode.childNodes[i], textBlock, elementStyle, (i === (htmlNode.childNodes.length - 1)))
    }
  }

  /**
   * Resizes the container div (osweb_div), which contains all elements on display
   * @param {Number} width - Width to set.
   * @param {Number} height -Hheight to set.
   */
  _resizeContainer (width, height) {
    // Set the parent container dimensions.
    this.experiment._runner._container.style.width = width + 'px'
    this.experiment._runner._container.style.height = height + 'px'
  }

  /**
   * Draws an arrow element on the canvas.
   * @param {Number} sx - The starting x coordinate of the element.
   * @param {Number} sy - The starting y coordinate of the element.
   * @param {Number} ex - The ending x coordinate of the element.
   * @param {Number} ey - The ending y coordinate of the element.
   * @param {Number} bodyWidth - The width of the element body.
   * @param {Number} bodyLength - The height of the element body.
   * @param {Number} headWidth - The width of the element head.
   * @param {Object} styleArgs - Optional styling arguments for the element.
   */
  arrow (sx, sy, ex, ey, bodyWidth, bodyLength, headWidth, styleArgs) {
    // Calculate coordinate points for the arrow.
    var points = this._arrow_shape(sx, sy, ex, ey, bodyWidth, bodyLength, headWidth)

    // Draw the arrow as a polygon.
    this.polygon(points, styleArgs)
  }

  /**
   * Draws an arrow element on the canvas.
   * @param {Number} sx - The x coordinate of the element.
   * @param {Number} sy - The y coordinate of the element.
   * @param {Number} ex - The radius the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  circle (x, y, r, styleArgs) {
    // Get the style
    var elementStyle = this._getStyle(styleArgs)

    // Create a circle element.
    var circle = new PIXI.Graphics()
    circle.lineStyle(elementStyle.penwidth, elementStyle.color, 1)
    if (elementStyle.fill === true) {
      circle.beginFill(elementStyle.background_color)
      circle.drawCircle(0, 0, r)
      circle.endFill()
    } else {
      circle.drawCircle(0, 0, r)
    }
    circle.x = x
    circle.y = y

    // Add the circle element to container.
    this._container.addChild(circle)
  }

  /**
   * Clear the current canvas.
   * @param {Number} background_color - The color to draw (optional).
   * @param {Object} style_args - JSON object containing style arguments (optional).
   */
  clear (backgroundColor, styleArgs) {
    // Clear the stage by temoving al the child elements.
    for (var i = this._container.children.length - 1; i >= 0; i--) {
      this._container.removeChild(this._container.children[i])
    }
  }

  /**
   * Copies the contents of the passed canvas onto current one.
   * @param  {osweb.canvas} canvas The source canvas to copy
   * @return {void}
   */
  copy (canvas) {
    this.clear()

    // Loop over the shapes on the passed canvas and copy them onto the current one
    for (const shape of canvas._container.children) {
      this._container.addChild(shape.clone())
    }
  }

  /**
   * Draws an ellipse element on the canvas.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {Number} w - The width the element.
   * @param {Number} h - The height the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  ellipse (x, y, w, h, styleArgs) {
    // Get the style
    var elementStyle = this._getStyle(styleArgs)

    // Create an ellipse element.
    var ellipse = new PIXI.Graphics()
    ellipse.lineStyle(elementStyle.penwidth, elementStyle.color, 1)
    if (elementStyle.fill === true) {
      ellipse.beginFill(elementStyle.background_color)
      ellipse.drawEllipse(0, 0, (w / 2), (h / 2))
      ellipse.endFill()
    } else {
      ellipse.drawEllipse(0, 0, (w / 2), (h / 2))
    }
    ellipse.x = x + (w / 2)
    ellipse.y = y + (h / 2)

    // Add the ellipse element to container.
    this._container.addChild(ellipse)
  }

  /**
   * Draws a fixdot element on the canvas.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  fixdot (x, y, style, styleArgs) {
    // Check the color and style arguments.
    style = (typeof style === 'undefined') ? 'default' : style

    // Get the style
    var elementStyle = this._getStyle(styleArgs)

    if (typeof x === 'undefined') {
      if (this.uniform_coordinates === true) {
        x = 0
      } else {
        x = this._width / 2
      }
    }
    if (typeof y === 'undefined') {
      if (this.uniform_coordinates === true) {
        y = 0
      } else {
        y = this._height / 2
      }
    }

    var s = 4
    var h = 2
    if (style.indexOf('large') !== -1) {
      s = 16
    } else if ((style.indexOf('medium') !== -1) || (style === 'default')) {
      s = 8
    } else if (style.indexOf('small') !== -1) {
      s = 4
    } else {
      this.experiment._runner._debugger.addError('Unknown style: ' + style)
    }

    var styles = new Styles()
    if ((style.indexOf('open') !== -1) || (style === 'default')) {
      styles._fill = true
      styles._background_color = elementStyle.color
      styles._color = elementStyle.color
      this.ellipse(x - s, y - s, 2 * s, 2 * s, styles)
      styles._background_color = elementStyle.background_color
      styles._color = elementStyle.background_color
      this.ellipse(x - h, y - h, 2 * h, 2 * h, styles)
    } else if (style.indexOf('filled') !== -1) {
      styles._fill = true
      styles._background_color = elementStyle.color
      styles._color = elementStyle.color
      this.ellipse(x - s, y - s, 2 * s, 2 * s, styles)
    } else if (style.indexOf('cross') !== -1) {
      styles._penwidth = 1
      styles._color = elementStyle.color
      this.line(x, y - s, x, y + s, styles)
      this.line(x - s, y, x + s, y, styles)
    } else {
      this.experiment._runner._debugger.addError('Unknown style: ' + style)
    }
  }

  /**
   * Draws a gabor element on the canvas.
   *
   * @param {Number} x The x coordinate of the element
   * @param {Number} y The y coordinate of the element
   * @param {float} orient The rotation of the element (range between 0 and 1)
   * @param {float} freq The frequency of the bands
   * @param {String} env The type of envelope used for the element
   * @param {*} size The size of the gabor
   * @param {*} stdev The standard deviation of the guass fade
   * @param {*} phase The phase of the element (start offset)
   * @param {*} color1 The first color for the element
   * @param {*} color2 The second color for the element
   * @param {*} bgmode The background mode of the element
   * @memberof Canvas
   */
  gabor (x, y, orient, freq, env, size, stdev, phase, color1, color2, bgmode) {
    // Returns a surface containing a Gabor patch.
    env = this._match_env(env)

    // Create a temporary canvas to make an image data array.
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const px = ctx.getImageData(0, 0, size, size)

    // Conver the orientation to radians.
    orient = Math.PI * orient / 180
    color1 = this._styles._convertColorValueToRGB(color1)
    color2 = this._styles._convertColorValueToRGB(color2)

    // rx and ry reflect the real coordinates in the target image
    for (let rx = 0; rx < size; rx++) {
      for (let ry = 0; ry < size; ry++) {
        // Distance from the center
        const dx = rx - 0.5 * size
        const dy = ry - 0.5 * size

        // Get the coordinates (x, y) in the unrotated Gabor patch.
        const t = Math.atan2(dy, dx) + orient
        const r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
        const ux = r * Math.cos(t)
        const uy = r * Math.sin(t)
        let f

        // Get the amplitude without the envelope (0 .. 1).
        let amp = 0.5 + 0.5 * Math.cos(2.0 * Math.PI * (ux * freq + phase))

        // The envelope adjustment
        if (env === 'g') {
          // $f = exp(-0.5 * pow($x / $std, 2) - 0.5 * pow($y / $std, 2));
          f = Math.exp(-0.5 * Math.pow(ux / stdev, 2) - 0.5 * Math.pow(uy / stdev, 2))
        } else if (env === 'l') {
          f = Math.max(0, (0.5 * size - r) / (0.5 * size))
        } else if (env === 'c') {
          if (r > 0.5 * size) {
            f = 0.0
          } else {
            f = 1.0
          }
        } else {
          f = 1.0
        }

        // Apply the envelope
        if (bgmode === 'avg') {
          amp = amp * f + 0.5 * (1.0 - f)
        } else {
          amp = amp * f
        }

        // Recalculate the color values.
        const color = {
          r: color1.r * amp + color2.r * (1.0 - amp),
          g: color1.g * amp + color2.g * (1.0 - amp),
          b: color1.b * amp + color2.b * (1.0 - amp)
        }

        // Set the color values at pixel level.
        var position = rx * 4 + (ry * size * 4)
        px.data[position] = color.r
        px.data[position + 1] = color.g
        px.data[position + 2] = color.b
        px.data[position + 3] = 255
      }
    }

    // Put the calculated data back on the canvas and create an image of it.
    ctx.putImageData(px, 0, 0)

    // Retrieve the image from the recourses
    var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas))

    // Position the image.
    sprite.x = x - (size / 2)
    sprite.y = y - (size / 2)

    // Add the image to the stage.
    this._container.addChild(sprite)
  }

  /**
   * Returns the canvas heigt
   * @return {Number} - The height of the canvas in pixels.
   */
  height () {
    return this._heigth
  }

  /**
   * Draws an image element on the canvas.
   * @param {String} fname - The name of the element to draw.
   * @param {Boolean|Number|String} center - If true the image is centered.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {Number} scale - The scaling factor of the element.
   */
  image (fname, center, x, y, scale) {
    // Get image from file pool.
    var name = this.experiment._runner._syntax.remove_quotes(fname)
    var path = this.experiment._runner._pool[name]
    if (typeof (path) === 'undefined') {
      this.experiment._runner._debugger.addError(`"${fname}" does not exist`)
    }
    var img = path.data
    // Create a temporary canvas to make an image data array.
    var canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas))

    // Scale the image.
    sprite.scale.x = scale
    sprite.scale.y = scale

    // Position the image
    if ([1, '1', true, 'yes'].indexOf(center) !== -1) {
      sprite.x = x - (sprite.width / 2)
      sprite.y = y - (sprite.height / 2)
    } else {
      sprite.x = x
      sprite.y = y
    }

    // Add the image to the stage.
    this._container.addChild(sprite)
  }

  /**
   * Initializes the  display container on which the canvas is displayed.
   * @param {Object} experiment - The experiment to which the canvas belongs.
   */
  init_display (experiment) {
    // Set the dimension properties.
    this._height = experiment.vars.height
    this._width = experiment.vars.width

    // PIXI: Set the renderer dimensions.
    experiment._runner._renderer.resize(this._width, this._height)

    // PIXI: Set the renderer background color.
    experiment._runner._renderer.clear(this._styles._convertColorValue(experiment.vars.background, 'number'))
    experiment._runner._renderer.backgroundColor = this._styles._convertColorValue(experiment.vars.background, 'number')

    // PIXU: Set the cursor visibility to none (default).
    experiment._runner._renderer.view.style.cursor = 'none'

    // Start the fullscreen mode (if enabled).
    experiment._runner._screen._fullScreenInit()

    // Set focus to the experiment canvas.
    experiment._runner._renderer.view.focus()
  }

  /**
   * Draws a line element on the canvas.
   * @param {Number} sx - The starting x coordinate of the element.
   * @param {Number} sy - The starting y coordinate of the element.
   * @param {Number} ex - The ending x coordinate of the element.
   * @param {Number} ey - The ending y coordinate of the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  line (sx, sy, ex, ey, styleArgs) {
    // Get the style
    var elementStyle = this._getStyle(styleArgs)

    // Create a line element.
    var line = new PIXI.Graphics()
    line.lineStyle(elementStyle.penwidth, elementStyle.color, 1)
    line.moveTo(0, 0)
    line.lineTo(ex - sx, ey - sy)
    line.x = sx
    line.y = sy

    // Add the line element to container.
    this._container.addChild(line)
  }

  /**
   * Draws a gabor element on the canvas.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {String} env - The type of envelop used  for the element.
   * @param {Object} size - Optional styling argument for the element.
   * @param {Number} stdev - The standard deviation  for the element.
   * @param {Number|String} color1 - The first color for the element.
   * @param {Number|String} color2 - Teh second color for the element.
   * @param {String} bgmode - The type of background mode for the element.
   */
  noise (x, y, env, size, stdev, color1, color2, bgmode) {
    // Returns a surface containing a noise patch.
    env = this._match_env(env)

    // Create a temporary canvas to make an image data array.
    var canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    var ctx = canvas.getContext('2d')
    var px = ctx.getImageData(0, 0, size, size)

    // Create a surface
    color1 = this._styles._convertColorValueToRGB(color1)
    color2 = this._styles._convertColorValueToRGB(color2)

    // rx and ry reflect the real coordinates in the target image
    for (let rx = 0; rx < size; rx++) {
      for (let ry = 0; ry < size; ry++) {
        // Distance from the center
        const ux = rx - 0.5 * size
        const uy = ry - 0.5 * size
        const r = Math.sqrt(Math.pow(ux, 2) + Math.pow(uy, 2))
        let f
        // Get the amplitude without the envelope (0 .. 1)
        var amp = Math.random()
        // The envelope adjustment
        if (env === 'g') {
          f = Math.exp(Math.pow(-0.5 * (ux / stdev), 2) - Math.pow(0.5 * (uy / stdev), 2))
        } else if (env === 'l') {
          f = Math.max(0, (0.5 * size - r) / (0.5 * size))
        } else if (env === 'c') {
          if (r > 0.5 * size) {
            f = 0.0
          } else {
            f = 1.0
          }
        } else {
          f = 1.0
        }

        // Apply the envelope
        if (bgmode === 'avg') {
          amp = amp * f + 0.5 * (1.0 - f)
        } else {
          amp = amp * f
        }

        // Recalculate the collor values.
        const color = {
          r: color1.r * amp + color2.r * (1.0 - amp),
          g: color1.g * amp + color2.g * (1.0 - amp),
          b: color1.b * amp + color2.b * (1.0 - amp)
        }

        // Set the color values at pixel level.
        var position = rx * 4 + (ry * size * 4)
        px.data[position] = color.r
        px.data[position + 1] = color.g
        px.data[position + 2] = color.b
        px.data[position + 3] = 255
      }
    }

    // Put the calculated data back on the canvas and create an image of it.
    ctx.putImageData(px, 0, 0)

    // Retrieve the image from the recourses
    var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas))

    // Position the image.
    sprite.x = x - (size / 2)
    sprite.y = y - (size / 2)

    // Add the image to the stage.
    this._container.addChild(sprite)
  }

  /**
   * Draws a polygon element on the canvas.
   * @param {Array} verticles - The coordinates of the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  polygon (verticles, styleArgs) {
    // Get the style
    var elementStyle = this._getStyle(styleArgs)

    // Adjust the points.
    var path = []
    for (var i = 0; i < verticles.length; i++) {
      path.push(verticles[i][0])
      path.push(verticles[i][1])
    }
    path.push(verticles[0][0])
    path.push(verticles[0][1])

    // Create a polygon element.
    var polygon = new PIXI.Graphics()
    polygon.lineStyle(elementStyle.penwidth, elementStyle.color, 1)
    if (elementStyle.fill === true) {
      polygon.beginFill(elementStyle.background_color)
      polygon.drawPolygon(path)
      polygon.endFill()
    } else {
      polygon.drawPolygon(path)
    }

    // Add the polygon item to container.
    this._container.addChild(polygon)
  }

  /** Implements the prepare phase of a canvas. */
  prepare () {}

  /**
   * Draws a rectangle element on the canvas.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {Number} w - The width of the element.
   * @param {Number} h - The height of the element.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  rect (x, y, w, h, styleArgs) {
    // Get the style
    var elementStyle = this._getStyle(styleArgs)
    // Create a rectangle element.
    var rectangle = new PIXI.Graphics()
    rectangle.lineStyle(elementStyle.penwidth, elementStyle.color, 1)
    if (elementStyle.fill === true) {
      rectangle.beginFill(elementStyle.background_color)
      rectangle.drawRect(0, 0, w, h)
      rectangle.endFill()
    } else {
      rectangle.drawRect(0, 0, w, h)
    }
    rectangle.x = x
    rectangle.y = y

    // Add the rectangle element to container.
    this._container.addChild(rectangle)
  }

  /**
   * Returns the size ion pixels of the canvas.
   * @return {Array} - The widht an height as an array tupple.
   */
  size () {
    // Create object tuple.
    var size = {
      width: this._width,
      height: this._height
    }
    return size
  }

  /**
   * Show a canvas on the ptimary canvas.
   * @param {Object} experiment - The experiment to which the canvas belongs.
   * @return {Number} - The current time stamp.
   */
  show (experiment) {
    // Check parameter.
    experiment = (typeof experiment !== 'undefined') ? experiment : this.experiment

    // Add the container to the stage object and update the stage.
    this.experiment._currentCanvas = this

    // Set the scaling.
    this._container.scale.x = this.experiment._scale_x
    this._container.scale.y = this.experiment._scale_y

    // Set renderer baxckground and render the content.
    this.experiment._runner._renderer.backgroundColor = this._styles._background_color
    this.experiment._runner._renderer.render(this._container)

    // Return the current time.
    if (experiment != null) {
      return experiment.clock.time()
    } else {
      return null
    }
  }

  /**
   * Draws a text element on the canvas.
   * @param {String} text - The x coordinate of the element.
   * @param {Boolean} center - If true the text must be centered.
   * @param {Number} x - The x coordinate of the element.
   * @param {Number} y - The y coordinate of the element.
   * @param {Boolean} html - If true the text parameter contains HTML tags.
   * @param {Object} styleArgs - Optional styling argument for the element.
   */
  text (text, center, x, y, html, styleArgs) {
    // Get the style
    const elementStyle = this._getStyle(styleArgs)

    // Only jump through the HTML rendering hoops if the html == 'yes' and
    // text actually contains HTML markup.
    if ((html === 'yes') && (this._containsHTML(text))) {
      //  Define the text block object.
      const textBlock = {
        element_style: elementStyle,
        height: 0,
        row: {
          ascent: 0,
          height: 0,
          text_elements: [],
          text_dimensions: [],
          text_underline: [],
          width: 0
        },
        rows: [],
        styles: [],
        width: 0,
        x_pos: 4,
        y_pos: 0
      }

      // First create a div container for parsing the html text.
      const div = document.createElement('div')
      document.body.appendChild(div)
      div.style.fontFamily = elementStyle.font_family
      div.style.fontSize = String(elementStyle.font_size) + 'px'
      div.style.fontWeight = (elementStyle.font_bold === true) ? 'bold' : 'normal'
      div.style.lineHeight = 'normal'
      div.style.display = 'inline-block'
      div.style.visibility = 'hidden'
      div.innerHTML = text

      // Parse the html recursive.
      this._parseHtmlNode(div, textBlock, elementStyle)

      // Remove the html div.
      document.body.removeChild(div)

      // Add the last row (if any).
      if (textBlock.row.text_elements.length !== 0) {
        textBlock.height = textBlock.height + textBlock.row.height
        textBlock.rows.push(textBlock.row)
      }

      // Recalculate the x and y positions depending on height, width and centering.
      textBlock.y_pos = 0
      for (let i = 0; i < textBlock.rows.length; i++) {
        // Parse a textline.
        for (let j = 0; j < textBlock.rows[i].text_elements.length; j++) {
          // Check for vertical correction.
          const adjust = textBlock.rows[i].ascent - textBlock.rows[i].text_dimensions[j].ascent
          textBlock.rows[i].text_elements[j].y = textBlock.y_pos + adjust

          // Check for horizontal centering.
          if ([1, '1', true, 'yes'].indexOf(center) !== -1) {
            textBlock.rows[i].text_elements[j].x = textBlock.rows[i].text_elements[j].x + x - (textBlock.rows[i].width / 2)
            textBlock.rows[i].text_elements[j].y = textBlock.rows[i].text_elements[j].y + y - (textBlock.height / 2)
          } else {
            textBlock.rows[i].text_elements[j].x = textBlock.rows[i].text_elements[j].x + x
            textBlock.rows[i].text_elements[j].y = textBlock.rows[i].text_elements[j].y + y + 6
          }

          // if underlined add additional styling.
          if (textBlock.rows[i].text_underline[j] === true) {
            this.line(textBlock.rows[i].text_elements[j].x,
              textBlock.rows[i].text_elements[j].y + textBlock.rows[i].text_dimensions[j].ascent + 7,
              textBlock.rows[i].text_elements[j].x + textBlock.rows[i].text_elements[j].width,
              textBlock.rows[i].text_elements[j].y + textBlock.rows[i].text_dimensions[j].ascent + 7,
              elementStyle)
          }

          // PIXI - Add text element to the stage.
          this._container.addChild(textBlock.rows[i].text_elements[j])
        }
        textBlock.y_pos = textBlock.y_pos + textBlock.rows[i].height
      }
    } else {
      // PIXI - Create the text element
      var textStyle = {
        fontFamily: elementStyle.font_family,
        fontSize: elementStyle.font_size,
        fontWeight: (elementStyle.font_bold === true) ? 'bold' : 'normal',
        fill: elementStyle.color
      }
      var textElement = new PIXI.Text(text, textStyle)

      if ([1, '1', true, 'yes'].indexOf(center) !== -1) {
        textElement.x = x - (textElement.width / 2)
        textElement.y = y - (textElement.height / 2)
      } else {
        textElement.x = x
        textElement.y = y
      }

      // PIXI - Add text element to the stage.
      this._container.addChild(textElement)
    }
  }
}
