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
          end_time: kwdict.end || 0,
          run_if: kwdict.runif || 'always'
        }
        this.schedule.push(task)
      }
    }
  }

  prepare () {
    console.log('Starting prepare')
    this.schedule = this.schedule.map(taskParams => {
      const item = this._runner._itemStore._items[taskParams.item_name]
      if (!item) {
        const msg = `Coroutines '${name}' - could not find item: ${taskParams.item_name}`
        this._runner._debugger.addError(msg)
        throw new Error(msg)
      }
      return new Task(item, ...Object.values(taskParams))
    })
    console.log('Finished prepare')
    super.prepare()
  }

  run () {
    console.log('Starting run phase')
    super.run()
    // Prepare all tasks
    for (const task of this.schedule) {
      this._runner._itemStore.prepare(task.item_name, this)
    }
    // Launch all tasks and wrap them in the coroutine helper
    for (let task in this.schedule) {
      task.launch()
    }

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
}

class Task {
  UNINITIALISED = 0
  RUNNING = 1
  ABORTED = 2
  FINISHED = 3

  constructor (item, item_name, start_time, end_time, run_if) {
    this.item = item
    this.item_name = item_name
    this.start_time = start_time
    this.end_time = end_time
    this.condition = run_if
    this.step = () => { throw new Error('Task has not been initialized') }
  }

  launch () {
    this.step = this._coroutine(this.item.coroutine)
  }

  _coroutine (f) {
    const o = f() // instantiate the coroutine
    o.next() // execute until the first yield
    return function (x) {
      o.next(x)
    }
  }
}
