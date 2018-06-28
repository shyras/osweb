import mockConsole from 'jest-mock-console'

// import Syntax from '../../osweb/classes/syntax'
import osweb from '../../osweb'
import VarStore from '../../osweb/classes/var_store'

// Already mock the console here to suppress pixi output
let restoreConsole
restoreConsole = mockConsole()

const renderTarget = document.createElement('div')
renderTarget.id = 'renderTarget'

const runner = osweb.getRunner(renderTarget)
restoreConsole()

describe('Syntax', function () {
  beforeEach(() => {
    restoreConsole = mockConsole()
  })

  afterEach(() => {
    restoreConsole()
  })

  describe('parse_cmd()', function () {
    var checkCmd = function (s, cmd, arglist, kwdict) {
      // parse command into arguments
      let _cmd, _arglist, _kwdict;
      [_cmd, _arglist, _kwdict] = runner._syntax.parse_cmd(s)
      expect(_cmd).toBe(cmd)
      expect(_arglist).toEqual(arglist)
      expect(_kwdict).toEqual(kwdict)
      // translate arguments back to command
      expect(s).toBe(runner._syntax.create_cmd(_cmd, _arglist, _kwdict))
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
    var tmp_var_store = new VarStore({
      syntax: runner._syntax
    }, null)
    tmp_var_store.width = 1024
    tmp_var_store.height = 768
    tmp_var_store.my_var99 = 99

    it('Should only parse real variables: \\\\[width] = \\[width] = [width]', function () {
      expect(runner._syntax.eval_text(
        '\\\\[width] = \\[width] = [width]', tmp_var_store)).toBe('\\1024 = [width] = 1024')
    })
    it('Should not try to parse a variable if [] contents contain spaces: [no var]', function () {
      expect(runner._syntax.eval_text(
        '[no var]', tmp_var_store)).toBe('[no var]')
    })
    it('Should not try to parse a variable if [] contents contain non-alphanumeric (unicode) characters: [nóvar]', function () {
      expect(runner._syntax.eval_text(
        '[nóvar]', tmp_var_store)).toBe('[nóvar]')
    })
    it('Should parse variables with underscores and numbers: [my_var99]', function () {
      expect(runner._syntax.eval_text(
        '[my_var99]', tmp_var_store)).toBe('99')
    })
    it('Should not try to parse a variable if it is preceded by a backslash: \\[width]', function () {
      expect(runner._syntax.eval_text(
        '\\[width]', tmp_var_store)).toBe('[width]')
    })
    it('Should ignore characters between variable definitions: [width] x [height]', function () {
      expect(runner._syntax.eval_text(
        '[width] x [height]', tmp_var_store)).toBe('1024 x 768')
    })
    it('Should process python code: [=10*10]', function () {
      expect(runner._syntax.eval_text(
        '[=10*10]', tmp_var_store)).toBe('100')
    })
    it('Should not process python code if it is preceded by a backslash: \\[=10*10]', function () {
      expect(runner._syntax.eval_text(
        '\\[=10*10]', tmp_var_store)).toBe('[=10*10]')
    })
    it('Should process string code: [="tést"]', function () {
      expect(runner._syntax.eval_text(
        '[="tést"]', tmp_var_store)).toBe('tést')
    })
    it('Should process string code: [="\\[test\\]"]', function () {
      expect(runner._syntax.eval_text(
        '[="\\[test\\]"]', tmp_var_store)).toBe('[test]')
    })
    it('Should process multiple variables: w: [width], h: [height]', function () {
      expect(runner._syntax.eval_text(
        'w: [width], h: [height]', tmp_var_store)).toBe('w: 1024, h: 768')
    })
    it('Should process multiple code blocks: w: [=1024], h: [=768]', function () {
      expect(runner._syntax.eval_text(
        'w: [=1024], h: [=768]', tmp_var_store)).toBe('w: 1024, h: 768')
    })
  })

  describe('compile_cond()', function () {
    it('Should convert a variable within [] to a variable name within the var context', function () {
      expect(runner._syntax.compile_cond(
        '[width] > 100', false)).toEqual('var.width > 100')
    })
    it('Should handle >= correctly', function () {
      expect(runner._syntax.compile_cond(
        '[width] >= 100', false)).toEqual('var.width >= 100')
    })
    it('Should handle <= correctly', function () {
      expect(runner._syntax.compile_cond(
        '[width] <= 100', false)).toEqual('var.width <= 100')
    })
    it('Should convert always to True', function () {
      expect(runner._syntax.compile_cond(
        'always', false)).toEqual(true)
    })
    it('Should convert ALWAYS to True', function () {
      expect(runner._syntax.compile_cond(
        'ALWAYS', false)).toEqual(true)
    })
    it('Should convert never to False', function () {
      expect(runner._syntax.compile_cond(
        'never', false)).toEqual(false)
    })
    it('Should convert NEVER to False', function () {
      expect(runner._syntax.compile_cond(
        'NEVER', false)).toEqual(false)
    })
    it('Should quote literals at the end of the string', function () {
      expect(runner._syntax.compile_cond(
        '[cue_side] = left', false)).toEqual('var.cue_side == "left"')
    })
    it('Should convert a single = to double ==', function () {
      expect(runner._syntax.compile_cond(
        '[width] = 1024', false)).toEqual('var.width == 1024')
    })
    it('Should handle underscores in variable names', function () {
      expect(runner._syntax.compile_cond(
        '[my_var99] = 1024', false)).toEqual('var.my_var99 == 1024')
    })
    it('Should handle lack of spaces surrounding = correctly', function () {
      expect(runner._syntax.compile_cond(
        '[width]=1024', false)).toEqual('var.width==1024')
    })
    it("Should not quote reserved words such as 'and' should also process double ==", function () {
      expect(runner._syntax.compile_cond(
        '[width] = 1024 and [height] == 768', false)).toEqual('var.width == 1024 and var.height == 768')
    })
    it('Should process a line starting with the = character as python script', function () {
      expect(runner._syntax.compile_cond(
        '=var.width > 100', false)).toEqual('var.width > 100')
    })
    it('Should ignore existing quotes and add new quotes', function () {
      expect(runner._syntax.compile_cond(
        '"yes" = yes', false)).toEqual('"yes" == "yes"')
    })
    it('Should process backslashes in a proper way', function () {
      expect(runner._syntax.compile_cond(
        'yes = \'yes\'', false)).toEqual('"yes" == \'yes\'')
    })
    it('Should process more complex structures with brackets', function () {
      expect(runner._syntax.compile_cond(
        '("a b c" = abc) or (x != 10) and ([width] == 100)', false)).toEqual('("a b c" == "abc") or ("x" != 10) and (var.width == 100)')
    })
  })
})
