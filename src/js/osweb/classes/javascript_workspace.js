/**
 * A proxy handler for the VarStore that maps properties onto calls to
 * VarStore.get(), so that variables are automatically evaluated, just like
 * in the OpenSesame `var` API.
 */
class VarStoreHandler {

  get(target, prop) {
    return typeof target[prop] === 'string'
      ? target.get(prop)
      : target[prop]
  }

}


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
    this.vars_proxy = new Proxy(this.experiment.vars, VarStoreHandler)
  }

  /**
     * Executes JavaScript code in the workspace.
     * @param {String} js - JavaScript code to execute
     */
  _eval(js) {
    let vars = this.vars_proxy
    eval(js)
  }
}
