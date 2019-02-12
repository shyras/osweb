/**
 * A workspace for executing inline JavaScript code. For now, the workspace is
 * not persistent, and only exposes the vars object.
 */
export default class JavaScriptWorkspace {

  /**
     * Create a JavaScript workspace.
     * @param {Object} experiment - The experiment item to which the item belongs.
     */
  constructor(experiment) {
    this.experiment = experiment
  }

  /**
     * Executes JavaScript code in the workspace.
     * @param {String} js - JavaScript code to execute
     */
  _eval(js) {
    let vars = this.experiment.vars
    eval(js)
  }
}
