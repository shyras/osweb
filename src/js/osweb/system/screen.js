import { isFunction } from 'lodash'
import * as PIXI from 'pixi.js'
import { VERSION_NUMBER } from '../index.js'

/** Class representing a Screen. */
export default class Screen {
  /**
   * Create an introduction screen which handles the start of the experiment.
   * @param {Object} runner - The runner class to which the screen belongs.
   */
  constructor (runner) {
    // Set class parameter properties.
    this._runner = runner // Parent runner attached to the screen object.

    // Set class properties.
    this._active = true // If true the introduction screen is shown.
    this._click = true // If true all is started with a mouse click.
    this._container = null // PIXI: Container which holds the screen info.
    this._exit = false // Exit toggle to prevent dialog when closing experiment.
  }

  screenCenter () {
    return {
      x: this._runner._renderer.width / 2,
      y: this._runner._renderer.height / 2
    }
  }

  /** Initialize the fullscreen mode if enabled. */
  _fullScreenInit () {
    // Check if fullscreen must be enabled.
    if (this._runner._fullScreen === true) {
      // Get the container element.
      var element = this._runner._container

      // Go full-screen
      if (element.requestFullscreen) {
        document.addEventListener('fullscreenchange', (e) => {
          this._fullScreenChanged(e)
        })
        document.addEventListener('fullscreenerror', (e) => {
          this._fullScreenError(e)
        })
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        document.addEventListener('webkitfullscreenchange', (e) => {
          this._fullScreenChanged(e)
        })
        document.addEventListener('webkitfullscreenerror', (e) => {
          this._fullScreenError(e)
        })
        element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        document.addEventListener('mozfullscreenchange', (e) => {
          this._fullScreenChanged(e)
        })
        document.addEventListener('mozfullscreenerror', (e) => {
          this._fullScreenError(e)
        })
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        document.addEventListener('MSFullscreenChange', (e) => {
          this._fullScreenChanged(e)
        })
        document.addEventListener('MSFullscreenError', (e) => {
          this._fullScreenError(e)
        })
        element.msRequestFullscreen()
      }
    }
  }

  /** Finalize the fullscreen mode if if was enabled. */
  _fullScreenExit () {
    // Check if fullscreen must be enabled.
    if (this._runner._fullScreen === true) {
      // Set the exit toggle.
      this._exit = true

      // Exit the full screen mode.
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  /** Event handler which responds to full-screen change. */
  _fullScreenChanged () {
    // Check if we are dropping out of full-screen.
    if (document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement) {
      // Scale the canvas
      switch (this._runner._scaleMode) {
        case 'noScale':
          // Default mode, no scaling, canbas is centered on the screen.
          this._runner._renderer.view.style.top = '0px'
          this._runner._renderer.view.style.bottom = '0px'
          this._runner._renderer.view.style.left = '0px'
          this._runner._renderer.view.style.right = '0px'
          this._runner._renderer.view.style.right = '0px'
          this._runner._renderer.view.style.margin = 'auto'
          this._runner._renderer.view.style.display = 'block'
          this._runner._renderer.view.style.position = 'absolute'
          this._runner._renderer.render(this._runner._experiment._currentCanvas._container)
          break
        case 'showAll':
          // Default mode, no scaling, canbas is centered on the screen.
          this._runner._renderer.view.style.top = '0px'
          this._runner._renderer.view.style.bottom = '0px'
          this._runner._renderer.view.style.left = '0px'
          this._runner._renderer.view.style.right = '0px'
          this._runner._renderer.view.style.right = '0px'
          this._runner._renderer.view.style.margin = 'auto'
          this._runner._renderer.view.style.display = 'block'
          this._runner._renderer.view.style.position = 'absolute'
          if ((this._runner._container.clientWidth - this._runner._experiment.vars.width) >
            (this._runner._container.clientHeight - this._runner._experiment.vars.height)) {
            let ar = (this._runner._container.clientHeight / this._runner._experiment.vars.height)
            this._runner._renderer.resize(Math.round(this._runner._experiment.vars.width * ar), this._runner._container.clientHeight)
            this._runner._experiment._scale_x = Math.round(this._runner._experiment.vars.width * ar) / this._runner._experiment.vars.width
            this._runner._experiment._scale_y = (this._runner._container.clientHeight / this._runner._experiment.vars.height)
          } else {
            let ar = (this._runner._container.clientWidth / this._runner._experiment.vars.width)
            this._runner._renderer.resize(this._runner._container.clientWidth, Math.round(this._runner._experiment.vars.height * ar))
            this._runner._experiment._scale_x = (this._runner._container.clientWidth / this._runner._experiment.vars.width)
            this._runner._experiment._scale_y = Math.round(this._runner._experiment.vars.height * ar) / this._runner._experiment.vars.height
          }
          this._runner._experiment._currentCanvas._container.scale.x = this._runner._experiment._scale_x
          this._runner._experiment._currentCanvas._container.scale.y = this._runner._experiment._scale_y
          this._runner._renderer.render(this._runner._experiment._currentCanvas._container)
          break
        case 'exactFit':
          // Fit to the exact window size (cropping).
          this._runner._experiment._scale_x = (this._runner._container.clientWidth / this._runner._experiment.vars.width)
          this._runner._experiment._scale_y = (this._runner._container.clientHeight / this._runner._experiment.vars.height)

          // Reize the current canvas.
          this._runner._renderer.resize(this._runner._container.clientWidth, this._runner._container.clientHeight)
          this._runner._experiment._currentCanvas._container.scale.x = this._runner._experiment._scale_x
          this._runner._experiment._currentCanvas._container.scale.y = this._runner._experiment._scale_y
          this._runner._renderer.render(this._runner._experiment._currentCanvas._container)
          break
      }
    } else {
      // Check for exiting experiment.
      if (this._exit === false) {
        // Resclae to 1Fit to the exact window size (cropping).
        this._runner._experiment._scale_x = 1
        this._runner._experiment._scale_y = 1

        // Fit to the exact window size (cropping).
        this._runner._renderer.resize(this._runner._experiment.vars.width, this._runner._experiment.vars.height)
        this._runner._experiment._currentCanvas._container.scale.x = 1
        this._runner._experiment._currentCanvas._container.scale.y = 1
        this._runner._renderer.render(this._runner._experiment._currentCanvas._container)

        // Open Sesame is running, request subject to continue of to stop.
        if (isFunction(this._runner._confirm)) {
          this._runner._confirm('Leaving full-screen mode, pausing experiment.',
            'Please press ok the resume the experiment otherwise cancel to stop.',
            this._onFullScreenConfirm.bind(this), this._onFullScreenCancel.bind(this))
        }
      }
    }
  }

  /** Event handler which responds to full-screen change errors. */
  _fullScreenError () {
    // Show error message.
    this._runner.debugger.addError('Could not start full-screen mode, experiment stopped.')
  }

  /** Event handler to respond to dialog ok conmfirmation. */
  _onFullScreenConfirm () {
    // Get the container element.
    var element = this._runner._container
    // Go full-screen
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }

  /** Event handler to respond to dialog cancel confirmation. */
  _onFullScreenCancel () {
    // Exit the experiment.
    this._runner._finalize()
  }

  /** Set the introscreen elements. */
  _setupIntroScreen () {
    // Check if introscreen is used.
    if (this._active === true) {
      // Define introscreen elements.
      this._introScreen = new PIXI.Container()

      const center = this.screenCenter()

      const logoPath = (typeof logoSrc === 'undefined') ? 'img/opensesame.png' : logoSrc

      const oswebLogo = new PIXI.Sprite.from(logoPath)
      const oswebTitle = new PIXI.Text('OSWeb', {
        fontFamily: 'Arial',
        fontSize: 26,
        fill: '#FFFFFF'
      })
      const versionInfo = new PIXI.Text(VERSION_NUMBER, {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: '#FFFFFF'
      })

      const copyrightText = new PIXI.Text(
        `Copyright Jaap Bos, Daniel Schreij & Sebastiaan Mathot, 2016 - ${(new Date()).getFullYear()}`,
        {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: '#FFFFFF'
        }
      )

      oswebLogo.width = oswebLogo.height = 150

      oswebLogo.position.set(center.x - oswebLogo.width / 2, 50)
      oswebTitle.position.set(center.x - oswebTitle.width / 2, 215)
      versionInfo.position.set(center.x - versionInfo.width / 2, 250)
      copyrightText.position.set(
        center.x - copyrightText.width / 2,
        center.y * 2 - copyrightText.height * 2
      )

      this._statusText = new PIXI.Text('', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: '#FFFFFF'
      })
      this._statusText.position.set(
        center.x - this._statusText.width / 2,
        center.y
      )
      this._introScreen.addChild(oswebLogo, oswebTitle,
        versionInfo, copyrightText, this._statusText)

      // Show the introduction screen.
      this._runner._renderer.render(this._introScreen)
    }
  }

  /** Check if the experiment must be clicked to start. */
  _setupClickScreen () {
    // Check if the experiment must be clicked to start.
    if (this._click === true) {
      // Update inroscreen.

      const text = `
    Your participation to this experiment should be anonymous.
        Never provide any personal or sensitive information
            (e.g. credit card or social security numbers).

                    Click here with the mouse to begin.`

      this._updateIntroScreen(text)

      // Setup the mouse click response handler.
      var clickHandler = function (event) {
        // Remove the handler.
        this._runner._renderer.view.removeEventListener('click', clickHandler)
        this._runner._renderer.view.removeEventListener('touchstart', clickHandler)

        // Finalize the introscreen elements.
        this._clearIntroScreen()

        // Start the task.
        this._runner._initialize()
      }.bind(this)

      // Set the temporary mouse click.
      this._runner._renderer.view.addEventListener('click', clickHandler, false)
      this._runner._renderer.view.addEventListener('touchstart', clickHandler, false)
    } else {
      // Finalize the introscreen elements.
      this._clearIntroScreen()

      // Start the runner.
      this._runner._initialize()
    }
  }

  /** Clear the introscreen elements. */
  _clearIntroScreen () {
    // Update the introscreen elements.
    if (this._active === true) {
      // Clear the stage by temoving al the child elements.
      for (var i = this._introScreen.children.length - 1; i >= 0; i--) {
        this._introScreen.removeChild(this._introScreen.children[i])
      };
      this._runner._renderer.render(this._introScreen)
    }
  }

  /**
   * Updates the progress bar used when loading the file pool.
   * @param {Number} percentage - The percentage (0-100) of the progress bar.
   */
  _updateProgressBar (percentage) {
    const center = this.screenCenter()

    const xOuter = 200
    const wOuter = 400
    const hOuter = 20
    const yOuter = center.y + 2 * hOuter

    if (this._active === true) {
      // Select the stage.
      switch (percentage) {
        case -1:
          this._progressBarOuter = new PIXI.Graphics()
          this._progressBarOuter.lineStyle(1, 0xFFFFFF, 1)
          this._progressBarOuter.drawRect(xOuter, yOuter, wOuter, hOuter)
          this._progressBarOuter.x = 0
          this._progressBarOuter.y = 0
          this._progressBarInner = new PIXI.Graphics()
          this._progressBarInner.lineStyle(1, 0xFFFFFF, 1)
          this._progressBarInner.drawRect(xOuter + 2, yOuter + 2, 1, hOuter - 4)
          this._progressBarInner.x = 0
          this._progressBarInner.y = 0
          this._introScreen.addChild(this._progressBarInner)
          this._introScreen.addChild(this._progressBarOuter)
          this._runner._renderer.render(this._introScreen)
          break
        case 100:
          this._introScreen.removeChild(this._progressBarInner)
          this._introScreen.removeChild(this._progressBarOuter)
          this._runner._renderer.render(this._introScreen)
          break
        default:
          this._progressBarOuter.beginFill(0xFFFFFF)
          this._progressBarOuter.drawRect(xOuter + 2, yOuter + 2, Math.round(percentage * (wOuter - 4)), hOuter - 4)
          this._progressBarOuter.endFill()
          this._runner._renderer.render(this._introScreen)
      }
    }
  }

  /**
   * Update the introscreen elements.
   * @param {String} text - The text which must be updated.
   */
  _updateIntroScreen (text) {
    // Update the introscreen elements.
    if (this._active === true) {
      const center = this.screenCenter()
      this._statusText.text = text
      this._statusText.position.set(
        center.x - this._statusText.width / 2,
        center.y
      )
      this._runner._renderer.render(this._introScreen)
    }
  }

  /** Show the pause screen. */
  _showPauseScreen () {
    // Open Sesame is running, request subject to continue of to stop.
    if (isFunction(this._runner._confirm)) {
      this._runner._confirm('Esc key pressed, pausing experiment.',
        'Please press ok the resume the experiment otherwise cancel to stop.',
        this._onPauseScreenConfirm.bind(this), this._onPauseScreenCancel.bind(this))
    }
  }

  /** Event handler to respond to dialog ok conmfirmation. */
  _onPauseScreenConfirm () {
    // Restore the old state.
    this._runner._events._state = this._runner._events._statePrevious
  }

  /** Event handler to respond to dialog cancel confirmation. */
  _onPauseScreenCancel () {
    // Exit the experiment.
    this._runner._finalize()
  }
}
