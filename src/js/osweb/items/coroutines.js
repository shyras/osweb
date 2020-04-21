import sortBy from 'lodash/sortBy'
import isFunction from 'lodash/isFunction'

import Item from './item.js'
import { constants } from '../system/constants.js'

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
    // The tasks to perform
    this.tasks = []
    // The tasks to perform this iteration
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
        this.tasks.push(task)
      }
    }
  }

  prepare () {
    this._runner._debugger.addMessage(`Preparing coroutines item '${this.name}'`)
    this.schedule = this.tasks.reduce((result, taskParams) => {
      const item_name = this._runner._syntax.eval_text(taskParams.item_name, this.vars)
      const item = this._runner._itemStore._items[item_name]
      if (!item) {
        const msg = `Coroutines '${this.name}' - could not find item: ${item_name}`
        this._runner._debugger.addError(msg)
        throw new Error(msg)
      }
      this._runner._pythonWorkspace['self'] = this
      if (this._runner._pythonWorkspace._eval(taskParams.run_if) === true) {
        const start_time = this._runner._syntax.eval_text(taskParams.start_time, this.vars)
        const end_time = this._runner._syntax.eval_text(taskParams.end_time, this.vars)
        result.push(new Task(item, item_name, start_time, end_time,
          taskParams.item_name === this.vars.get('end_after_item')))
      }
      return result
    }, [])
    super.prepare()
  }

  run () {
    this._runner._debugger.addMessage(`Running coroutines item '${this.name}'`)
    super.run()
    // Prepare all tasks
    for (let task of this.schedule) {
      this._runner._itemStore.prepare(task.item_name, this)
    }
    this.schedule = sortBy(this.schedule, 'start_time')
    // Launch all tasks and wrap them in the coroutine helper
    for (let task of this.schedule) {
      this._runner._debugger.addMessage(`Launching task '${task.item_name}'`)
      task.launch()
    }

    this.active = []
    this.dt = 0
    this.t0 = performance.now()
    this.running = true

    this._loop()
  }

  _loop () {
    while (this.schedule.length > 0 && this.schedule[0].started(this.dt)) {
      this.active.push(this.schedule.shift())
    }
    this.active = sortBy(this.active, 'end_time')
    let _active = []
    for (let task of this.active) {
      let status = task.step()
      if (status === task.RUNNING) {
        _active.push(task)
        continue
      }
      if (status === task.ABORTED) {
        this.running = false
      }
    }
    this.active = _active
    while (this.active.length > 0 && this.active[0].stopped(this.dt)) {
      this.active.shift()
    }

    this.dt = performance.now() - this.t0
    if (this.running && this.dt < this.vars.get('duration') &&
      ![constants.TIMER_BREAK, constants.TIMER_EXIT, constants.TIMER_ERROR]
        .includes(this._runner._events._state)) {
      setTimeout(this._loop.bind(this), 0) // The well-known trick to deal with JS async nature...
    } else {
      // Kill all remaining tasks
      for (let task of this.active) {
        this._runner._debugger.addMessage(`Killing task '${task.item_name}'`)
        task.kill()
      }
      this._complete()
    }
  }
}

class Task {
  UNINITIALISED = 0
  RUNNING = 1
  FINISHED = 2
  ABORTED = -1

  constructor (item, item_name, start_time, end_time, abort_on_end) {
    this.item = item
    this.item_name = item_name
    this.start_time = start_time
    this.end_time = end_time
    this.abort_on_end = abort_on_end
    this.state = this.UNINITIALISED
    this._coroutine = null
    this.step = () => { throw new Error('Task has not been initialized') }
  }

  launch () {
    if (!isFunction(this.item.coroutine)) {
      throw new Error(`Item ${this.item_name} does not have correct coroutine implementation`)
    }
    this._coroutine = this.item.coroutine()
    this._coroutine.next()
    this.step = () => {
      // console.log(`Stepping ${this.item_name}`)
      const { value, done } = this._coroutine.next(true)
      if (value === false) {
        this.state = this.ABORTED
        return this.ABORTED
      }
      if (done === true) {
        let newState
        if (this.abort_on_end) {
          newState = this.ABORTED
        } else {
          newState = this.FINISHED
        }
        this.state = newState
        return this.state
      }
      return this.state // Should be this.RUNNING
    }
    this.state = this.RUNNING
  }

  started (dt) {
    return dt >= this.start_time
  }

  stopped (dt) {
    if (dt < this.end_time) {
      return false
    }
    return this.kill()
  }

  kill () {
    let response = this._coroutine.next(false)
    if (response.done === true) {
      this.state = this.FINISHED
      return true
    } else {
      return false
    }
  }
}
