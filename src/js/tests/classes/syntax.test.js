import mockConsole from 'jest-mock-console'

import Runner from '../../osweb/system/runner'
import Syntax from '../../osweb/classes/syntax'
import PythonParser from '../../osweb/python/python'
import VarStore from '../../osweb/classes/var_store'

const mockUpdateIntroScreen = jest.fn()
const mockUpdateProgressBar = jest.fn()
const mockAddMessage = jest.fn()
const mockAddError = jest.fn()

jest.mock('../../osweb/system/runner', () => {
  return jest.fn().mockImplementation(() => {
    return {
      _screen: {
        _updateIntroScreen: mockUpdateIntroScreen,
        _updateProgressBar: mockUpdateProgressBar
      },
      _debugger: {
        addMessage: mockAddMessage,
        addError: mockAddError
      }
    }
  })
})

const runner = new Runner()
runner._pythonParser = new PythonParser(runner)
const syntax = new Syntax(runner)

// Already mock the console here to suppress pixi output
let restoreConsole
restoreConsole = mockConsole()

// const renderTarget = document.createElement('div')
// renderTarget.id = 'renderTarget'

// const runner = osweb.getRunner(renderTarget)
restoreConsole()

describe('Syntax', function () {
  beforeEach(() => {
    restoreConsole = mockConsole()
  })

  afterEach(() => {
    restoreConsole()
  })

  describe('strip_slashes()', function () {
    it('should strip escape slashes from a string', () => {
      for (const [input, expectedOutput] of [
        ['\\\\', '\\'],
        ['\\\\\\', '\\\\'],
        ['\\\\\\"\\\\\\"', '\\"\\"'],
        ['"\\"quoted\\""', '""quoted""']
      ]) {
        expect(syntax.strip_slashes(input)).toBe(expectedOutput)
      }
    })
  })

  describe('parse_cmd()', function () {
    var checkCmd = function (s, cmd, arglist, kwdict) {
      // parse command into arguments
      let _cmd, _arglist, _kwdict;
      [_cmd, _arglist, _kwdict] = syntax.parse_cmd(s)
      expect(_cmd).toBe(cmd)
      expect(_arglist).toEqual(arglist)
      expect(_kwdict).toEqual(kwdict)
      // translate arguments back to command
      expect(s).toBe(syntax.create_cmd(_cmd, _arglist, _kwdict))
    }

    it('should parse command with arguments and keyword arguments', function () {
      checkCmd('widget 0 0 1 1 label text="Tést 123"',
        'widget', [0, 0, 1, 1, 'label'], {
          'text': 'Tést 123'
        })
    })
    it('should parse a single command with no arguments', function () {
      checkCmd('test', 'test', [], {})
    })
    it('should parse command with escaped backslashes', function () {
      checkCmd('set test "c:\\\\" x="d:\\\\"',
        'set', ['test', 'c:\\'], {
          'x': 'd:\\'
        })
    })
    it('should ignore/not parse contents quoted keyword argument values', function () {
      checkCmd('draw fixdot color="#ff000b" show_if="[correct] = 0" x=0 y=0',
        'draw', ['fixdot'], {
          color: '#ff000b',
          show_if: '[correct] = 0',
          x: 0,
          y: 0
        })
    })
    it('should not parse contents of a (non-keyword arg) string value', function () {
      checkCmd('run correct_sound "[correct]=1"',
        'run', ['correct_sound', '[correct]=1'], {})
    })
    it('should be able to handle escaped backslashes', function () {
      checkCmd('test "\\"quoted\\""',
        'test', ['"quoted"'], {})
    })
    it('should be able to handle escaped backslashes in keyword arguments', function () {
      checkCmd('test test="\\"quoted\\""', 'test', [], {
        'test': '"quoted"'
      })
    })
    it("should throw an exception when string can't be parsed", function () {
      expect(function () {
        checkCmd('widget 0 0 1 1 label text="Tést 123',
          'widget', [0, 0, 1, 1, 'label'], {
            'text': 'Tést 123'
          })
      }).toThrow()
    })
  })

  describe('eval_text()', function () {
    var tmpVarStore = new VarStore({
      syntax: syntax
    }, null)

    tmpVarStore.width = 1024
    tmpVarStore.height = 768
    tmpVarStore.my_var99 = 99

    it('Should only parse real variables: \\\\[width] = \\[width] = [width]', function () {
      expect(syntax.eval_text(
        '\\\\[width] = \\[width] = [width]', tmpVarStore)).toBe('\\1024 = [width] = 1024')
    })
    it('Should not try to parse a variable if [] contents contain spaces: [no var]', function () {
      expect(syntax.eval_text(
        '[no var]', tmpVarStore)).toBe('[no var]')
    })
    it('Should not turn an empty string into the number 0', function () {
      expect(syntax.eval_text(
        '', tmpVarStore)).toBe('')
    })
    it('Should not try to parse a variable if [] contents contain non-alphanumeric (unicode) characters: [nóvar]', function () {
      expect(syntax.eval_text(
        '[nóvar]', tmpVarStore)).toBe('[nóvar]')
    })
    it('Should parse variables with underscores and numbers: [my_var99]', function () {
      expect(syntax.eval_text(
        '[my_var99]', tmpVarStore)).toBe(99)
    })
    it('Should not try to parse a variable if it is preceded by a backslash: \\[width]', function () {
      expect(syntax.eval_text(
        '\\[width]', tmpVarStore)).toBe('[width]')
    })
    it('Should ignore characters between variable definitions: [width] x [height]', function () {
      expect(syntax.eval_text(
        '[width] x [height]', tmpVarStore)).toBe('1024 x 768')
    })
    it('Should process python code: [=10*10]', function () {
      expect(syntax.eval_text(
        '[=10*10]', tmpVarStore)).toBe(100)
    })
    it('Should not process python code if it is preceded by a backslash: \\[=10*10]', function () {
      expect(syntax.eval_text(
        '\\[=10*10]', tmpVarStore)).toBe('[=10*10]')
    })
    it('Should process string code: [="tést"]', function () {
      expect(syntax.eval_text(
        '[="tést"]', tmpVarStore)).toBe('tést')
    })
    it('Should process string code: [="\\[test\\]"]', function () {
      expect(syntax.eval_text(
        '[="\\[test\\]"]', tmpVarStore)).toBe('[test]')
    })
    it('Should process multiple variables: w: [width], h: [height]', function () {
      expect(syntax.eval_text(
        'w: [width], h: [height]', tmpVarStore)).toBe('w: 1024, h: 768')
    })
    it('Should process multiple code blocks: w: [=1024], h: [=768]', function () {
      expect(syntax.eval_text(
        'w: [=1024], h: [=768]', tmpVarStore)).toBe('w: 1024, h: 768')
    })
  })

  describe('compile_cond()', function () {
    it('Should convert a variable within [] to a variable name within the var context', function () {
      expect(syntax.compile_cond(
        '[width] > 100', false)).toEqual('var.width > 100')
    })
    it('Should handle >= correctly', function () {
      expect(syntax.compile_cond(
        '[width] >= 100', false)).toEqual('var.width >= 100')
    })
    it('Should handle <= correctly', function () {
      expect(syntax.compile_cond(
        '[width] <= 100', false)).toEqual('var.width <= 100')
    })
    it('Should convert always to True', function () {
      expect(syntax.compile_cond(
        'always', false)).toEqual(true)
    })
    it('Should convert ALWAYS to True', function () {
      expect(syntax.compile_cond(
        'ALWAYS', false)).toEqual(true)
    })
    it('Should convert never to False', function () {
      expect(syntax.compile_cond(
        'never', false)).toEqual(false)
    })
    it('Should convert NEVER to False', function () {
      expect(syntax.compile_cond(
        'NEVER', false)).toEqual(false)
    })
    it('Should quote literals at the end of the string', function () {
      expect(syntax.compile_cond(
        '[cue_side] = left', false)).toEqual('var.cue_side == "left"')
    })
    it('Should convert a single = to double ==', function () {
      expect(syntax.compile_cond(
        '[width] = 1024', false)).toEqual('var.width == 1024')
    })
    it('Should handle underscores in variable names', function () {
      expect(syntax.compile_cond(
        '[my_var99] = 1024', false)).toEqual('var.my_var99 == 1024')
    })
    it('Should handle lack of spaces surrounding = correctly', function () {
      expect(syntax.compile_cond(
        '[width]=1024', false)).toEqual('var.width==1024')
    })
    it("Should not quote reserved words such as 'and' should also process double ==", function () {
      expect(syntax.compile_cond(
        '[width] = 1024 and [height] == 768', false)).toEqual('var.width == 1024 and var.height == 768')
    })
    it('Should process a line starting with the = character as python script', function () {
      expect(syntax.compile_cond(
        '=var.width > 100', false)).toEqual('var.width > 100')
    })
    it('Should ignore existing quotes and add new quotes', function () {
      expect(syntax.compile_cond(
        '"yes" = yes', false)).toEqual('"yes" == "yes"')
    })
    it('Should process backslashes in a proper way', function () {
      expect(syntax.compile_cond(
        'yes = \'yes\'', false)).toEqual('"yes" == \'yes\'')
    })
    it('Should process more complex structures with brackets', function () {
      expect(syntax.compile_cond(
        '("a b c" = abc) or (x != 10) and ([width] == 100)', false)).toEqual('("a b c" == "abc") or ("x" != 10) and (var.width == 100)')
    })
  })
})
