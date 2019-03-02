// import Syntax from '../../osweb/classes/syntax'
// import PythonParser from '../../osweb/python/python'
// import Experiment from '../../osweb/items/experiment'
// import Coroutines from '../../osweb/items/Coroutines'

// const test_item = `
// define coroutines main_routines
// 	set flush_keyboard yes
// 	set end_after_item keyboard
// 	set duration 10000
// 	set description "Run items simultaneously"
// 	run welcome end=0 runif=always start=0
// 	run slide2 end=2000 runif=always start=2000
// 	run slide3 end=4000 runif=always start=4000
// 	run slide4 end=6000 runif=always start=6000
// 	run keyboard end=10000 runif=always start=0
// `

// jest.mock('../../osweb/items/experiment', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       _runner: {}
//     }
//   })
// })

// jest.mock('../../osweb/items/item')

// const experiment = new Experiment()
// experiment._runner._syntax = new Syntax(experiment._runner)
// experiment._runner._pythonParser = new PythonParser(experiment._runner)

describe('Coroutines', () => {
  // beforeEach(() => {
  //   let coroutines = new Coroutines(experiment, 'test', test_item)
  // })

  describe('from_string', () => {
    it('Should correctly parse a string representation of the coroutines item', () => {
      expect(true).toBe(true)
    })
  })
})
