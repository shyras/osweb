import {
  constants
} from './constants.js'

import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'

/** Class representing a debugger. */
export default class Debugger {
  /**
   * Create a debugger which handles errors and messahes during an session.
   * @param {Object} runner - The runner class to which the debugger belongs.
   */
  constructor (runner) {
    // Create and set private properties.
    this._runner = runner // Parent runner attached to the debugger.

    // Create and set public properties.
    this.enabled = true // Enable the debugger.
    this.error = false // True if an error occured.
    this.messageLog = [] // Arraty with alle log messages.
  }

  /** Initialize the debugger object class. */
  _initialize () {
    // Clear the log.
    this.messageLog = []
  }

  /** Finalize the debugger object class. */
  _finalize () {
    // If enabled push the messages to the javascript console.
    if (this.enabled === true) {
      console.log(this.messageLog)
    }

    // Clear the log.
    this.messageLog = []
  }

  /**
   * Show a fatal error to the user and stops the running of the experiment.
   * @param {String} errorText - The error shown to the user.
   */
  addError (errorText, context = null) {
    // Set the error flag.
    this.error = true

    // Set status of the event system to break.
    this._runner._events.state = constants.TIMER_ERROR

    // Throw the exception.
    console.error('OSWeb has stopped running due to a fatal error.')
    console.error(errorText)

    if (isPlainObject(context)) {
      if (context.notify === true && isFunction(this._runner._onError)) {
        const url = context.url || null
        this._runner._onError(errorText, url)
      }
    }
  }

  /**
   * Add a message to the debugger list.
   * @param {String} message - The message to be added to the list.
   */
  addMessage (messageText) {
    // Push the error message to the log.
    this.messageLog.push(messageText)

    if (this.enabled === true) {
      console.log(messageText)
    }
  }

  /**
   * Mirror function for the AddMessage method.
   * @param {String} messageText - The message to be added to the list.
   */
  msg (messageText) {
    // Push the error message to the log.
    this.addMessage(messageText)
  }
}
