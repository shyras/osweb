import Item from './item.js'

/**
 * Class representing an inline item.
 * @extends Item
 */
export default class InlineJavaScript extends Item {
  /**
     * Create an inline item which executes inline python code.
     * @param {Object} experiment - The experiment item to which the item belongs.
     * @param {String} name - The unique name of the item.
     * @param {String} script - The script containing the properties of the item.
     */
  constructor (experiment, name, script) {
    // Inherited create.
    super(experiment, name, script)
    // Define and set the public properties.
    this.description = 'Executes JavaScript code (ECMA 5.1)'
    this.workspace = experiment._javascriptWorkspace
    // Process the script
    this.from_string(script)
  }

  /** Reset all item variables to their default value. */
  reset () {
    this.vars._prepare = ''
    this.vars._run = ''
  }

  /**
     * Parse a definition string and retrieve all properties of the item.
     * @param {String} script - The script containing the properties of the item.
     */
  from_string (script) {
    // Parses a definition string.
    this.reset()
    // Split the string into an array of lines.
    if (script !== null) {
      var read_run_lines = false
      var read_prepare_lines = false
      var lines = script.split('\n')
      for (var i = 0; i < lines.length; i++) {
        var tokens = this.syntax.split(lines[i])
        if ((tokens !== null) && (tokens.length > 0)) {
          switch (tokens[0]) {
            case 'set':
              this.parse_variable(lines[i])
              break
            case '__end__':
              read_run_lines = false
              read_prepare_lines = false
              break
            case '___prepare__':
              read_prepare_lines = true
              break
            case '___run__':
              read_run_lines = true
              break
            default:
              if (read_run_lines === true) {
                this.vars._run = this.vars._run + lines[i] + '\n'
              } else if (read_prepare_lines === true) {
                this.vars._prepare = this.vars._prepare + lines[i] + '\n'
              }
          }
        } else {
          if (read_run_lines === true) {
            this.vars._run = this.vars._run + lines[i] + '\n'
          } else if (read_prepare_lines === true) {
            this.vars._prepare = this.vars._prepare + lines[i] + '\n'
          }
        }
      }
    }
  }

  /** Implements the prepare phase of an item. */
  prepare () {
    this.workspace._eval(this.vars._prepare)
    super.prepare()
  }

  /** Implements the run phase of an item. */
  run () {
    super.run()
    this.set_item_onset()
    this.workspace._eval(this.vars._run)
    this._complete()
  }
}
