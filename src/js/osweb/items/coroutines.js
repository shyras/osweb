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
    // The variable that holds all child coroutine items
    this.schedule = []
    // Process the script.
    this.from_string(script)
  }

  from_string (script) {
    if (script === null) return
    for (let s of script.split('\n')) {
      const [cmd, arglist, kwdict] = this.experiment.syntax.parse_cmd(s)
      if (cmd === 'set') {
        const [variable, value] = arglist
        this[variable] = value
      }
      if (cmd === 'run' && arglist.length) {
        const task = {
          item_name: arglist.shift(),
          start_time: kwdict.start || 0,
          end_time: kwdict.end || null,
          run_if: kwdict.runif || 'always'
        }
        this.schedule.push(task)
      }
    }
  }
}
