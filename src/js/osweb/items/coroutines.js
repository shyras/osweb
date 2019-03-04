import Item from './item.js'
import sortBy from 'lodash/sortBy'

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
        this.vars[variable] = value
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

  prepare () {
    super.prepare()
    this.schedule = this.schedule.map(task => {
      const item = this._runner._itemStore._items[task.item_name]
      if (item) {
        const msg = `Coroutines '${name}' - could not find item: ${this.item_name}`
        this._runner._debugger.addError(msg)
        throw new Error(msg)
      }
      return new Task(item, ...task)
    })
  }

  run () {
    super.run()
    // Prepare all tasks
    for (const task of this.schedule) {
      this._runner._itemStore.prepare(task.item_name, this)
    }
    // Launch all tasks and wrap them in the coroutine helper
    this.schedule = this.schedule.map(task => {
      task.step = this._coroutine(task.item.coroutine)
      return task
    })

    this.schedule = sortBy(this.schedule, 'start_time')

    let active = []
    let dt = 0
    const t0 = performance.now()
    let running = true
    while (running && dt < this.vars.duration) {
      while (length(this.schedule) && this.schedule[0].started(dt)) {
        active.push(this.schedule.shift())
        active = sortBy(active, 'end_time')
      }
      dt = performance.now() - t0
    }
  }

  _coroutine (f) {
    const o = f() // instantiate the coroutine
    o.next() // execute until the first yield
    return function (x) {
      o.next(x)
    }
  }
}

class Task {
  construct (item, item_name, start_time, end_time, run_if) {
    this.item = item
    this.item_name = item_name
    this.start_time = start_time
    this.end_time = end_time
    this.condition = run_if
  }
}
