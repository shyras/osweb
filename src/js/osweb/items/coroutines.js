import Item from './item.js'

/**
 * Class representing coroutines
 * @extends Item
 */
export default class Coroutines extends Item {
  constructor (experiment, name, script) {
    // Inherited create.
    super(experiment, name, script)
    // Definition of public properties.
    this.description = 'Repeatedly runs another item'
    // Process the script.
    this.from_string(script)

    this.coroutines = []
  }

  from_string (script) {

  }
}
