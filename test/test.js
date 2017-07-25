var node_mode = false;
if (typeof(require) != "undefined") {
	var node_mode = true;
}

if (node_mode) {
	var sinon = require("sinon");
	var expect = require("chai").expect;
	var proxyquire = require("proxyquire");

	// pixi-shim.js
	global.document = require('jsdom').jsdom();
	global.window = document.defaultView;
	global.window.document = global.document;

	/*
	global.Canvas = require('canvas');
	global.Image = require('canvas').Image;

	// Node canvas Image's dont currently have `addEventListener` so we fake it for now.
	// We can always make updates to the node-canvas lib
	global.Image.prototype.addEventListener = function(event, fn) {
		const img = this;

		switch (event) {
			case 'error':
				img.onerror = function() {
					img.onerror = null;
					img.onload = null;
					fn.call(img);
				};
				break;

			case 'load':
				img.onload = function() {
					img.onerror = null;
					img.onload = null;
					fn.call(img);
				};
				break;
		}
	};

	global.Image.prototype.removeEventListener = function() {};
	global.navigator = {
		userAgent: 'node.js'
	}; // could be anything

	*/

	var osweb = require('../src/js/osweb/index.js').default;
	var renderTarget = document.createElement("div");
	renderTarget.id = "renderTarget";
	
	var VarStore = require('../src/js/osweb/classes/var_store.js').default;
	var Canvas = require('../src/js/osweb/backends/canvas.js').default;
	var runner = osweb.getRunner(renderTarget);
} else {
	var expect = chai.expect;
	var stub = sinon.stub;
	var runner = osweb.getRunner('renderTarget');

	var VarStore = function(data, second){
		this._runner = data.runner;
	}
}

// var Script = '---' + '\n' +
// 	'API: 2' + '\n' +
// 	'OpenSesame: 3.0.2' + '\n' +
// 	'Platform: nt' + '\n' +
// 	'---' + '\n' +
// 	'set width 1024' + '\n' +
// 	'set uniform_coordinates "yes"' + '\n' +
// 	'set title "New experiment"' + '\n' +
// 	'set subject_parity "even"' + '\n' +
// 	'set subject_nr 0' + '\n' +
// 	'set start "block"' + '\n' +
// 	'set height 768' + '\n' +
// 	'set foreground "white"' + '\n' +
// 	'set description "Default description"' + '\n' +
// 	'set coordinates "uniform"' + '\n' +
// 	'set compensation 0' + '\n' +
// 	'set canvas_backend "xpyriment"' + '\n' +
// 	'set background "black"' + '\n' +
// 	'' + '\n' +
// 	'define sequence block' + '\n' +
// 	'	set flush_keyboard "yes"' + '\n' +
// 	'	set description "Runs a number of items in sequence"' + '\n' +
// 	'	run new_loop always' + '\n' +
// 	'' + '\n' +
// 	'define loop new_loop' + '\n' +
// 	'	set skip 0' + '\n' +
// 	'	set repeat 1' + '\n' +
// 	'	set order "sequential"' + '\n' +
// 	'	set offset "no"' + '\n' +
// 	'	set item "trial"' + '\n' +
// 	'	set description "Repeatedly runs another item"' + '\n' +
// 	'	set cycles 2' + '\n' +
// 	'	set column_order "stimulus;counter"' + '\n' +
// 	'	set break_if "never"' + '\n' +
// 	'	setcycle 0 stimulus "page 1<br/><br/>Next line"' + '\n' +
// 	'	setcycle 0 counter "1"' + '\n' +
// 	'	setcycle 1 stimulus "page 2"' + '\n' +
// 	'	setcycle 1 counter "2"' + '\n' +
// 	'	setcycle 2 stimulus "page 3"' + '\n' +
// 	'	setcycle 2 counter "3"' + '\n' +
// 	'	run trial' + '\n' +
// 	'' + '\n' +
// 	'define sequence trial' + '\n' +
// 	'	set flush_keyboard "yes"' + '\n' +
// 	'	set description "Runs a number of items in sequence"' + '\n' +
// 	'	run welcome always' + '\n' +
// 	'' + '\n' +
// 	'define sketchpad welcome' + '\n' +
// 	'	set start_response_interval "no"' + '\n' +
// 	'	set reset_variables "no"' + '\n' +
// 	'	set duration "keypress"' + '\n' +
// 	'	set description "Displays stimuli"' + '\n' +
// 	'	draw textline center=1 color=white font_bold=no font_family=serif font_italic=no font_size=32 html=yes show_if=always text="OpenSesame 3.0.0 [stimulus]" x=0 y=0 z_index=0' + '\n';

// // Definition of the experiment object and its properties.
// var Experiment = {
// 	'source': Script
// };

describe('Syntax', function() {
	// Suppress error output
	var console_stub;
	beforeEach(function(){
		console_stub = sinon.stub(console, "error");
	});
	afterEach(function(){
		console_stub.restore();
	});

	describe('parse_cmd()', function() {
		var checkCmd = function(s, cmd, arglist, kwdict) {
			// parse command into arguments
			let _cmd, _arglist, _kwdict;
			[_cmd, _arglist, _kwdict] = runner._syntax.parse_cmd(s);
			expect(_cmd).to.equal(cmd);
			expect(_arglist).to.deep.equal(arglist);
			expect(_kwdict).to.deep.equal(kwdict);
			// translate arguments back to command
			expect(s).to.equal(runner._syntax.create_cmd(_cmd, _arglist, _kwdict));
		};

		it("should parse command with arguments and keyword arguments", function() {
			checkCmd('widget 0 0 1 1 label text="Tést 123"',
				'widget', [0, 0, 1, 1, 'label'], {
					'text': 'Tést 123'
				});
		});

		it("should parse a single command with no arguments", function() {
			checkCmd('test', 'test', [], {});
		});

		it("should parse command with escaped backslashes", function() {
			checkCmd('set test "c:\\\\" x="d:\\\\"',
				'set', ['test', 'c:\\'], {
					'x': 'd:\\'
				});
		});

		it("should ignore/not parse contents quoted keyword argument values", function() {
			checkCmd('draw fixdot color="#ff000b" show_if="[correct] = 0" x=0 y=0',
				'draw', ['fixdot'], {
					color: "#ff000b",
					show_if: "[correct] = 0",
					x: 0,
					y: 0
				});
		});

		it("should not parse contents of a (non-keyword arg) string value", function() {
			checkCmd('run correct_sound "[correct]=1"',
				'run', ['correct_sound', '[correct]=1'], {});
		});

		it("should be able to handle escaped backslashes", function() {
			checkCmd('test "\\"quoted\\""',
				'test', ['\"quoted\"'], {});
		});

		it("should be able to handle escaped backslashes in keyword arguments", function() {
			checkCmd('test test="\\"quoted\\""', 'test', [], {
				'test': '\"quoted\"'
			});
		});

		it("should throw an exception when string can't be parsed", function() {
			expect(function() {
				checkCmd('widget 0 0 1 1 label text="Tést 123',
					'widget', [0, 0, 1, 1, 'label'], {
						'text': 'Tést 123'
					});
			}).to.throw();
		});
	});

	describe('eval_text()', function() {
		var tmp_var_store = new VarStore({syntax: runner._syntax}, null);
		tmp_var_store.width = 1024;
		tmp_var_store.height = 768;
		tmp_var_store.my_var99 = 99;

		it("Should only parse real variables: \\\\[width] = \\[width] = [width]", function() {
			expect(runner._syntax.eval_text(
				'\\\\[width] = \\[width] = [width]', tmp_var_store)).to.equal('\\1024 = [width] = 1024');
		});

		it("Should not try to parse a variable if [] contents contain spaces: [no var]", function() {
			expect(runner._syntax.eval_text(
				'[no var]', tmp_var_store)).to.equal('[no var]');
		});

		it("Should not try to parse a variable if [] contents contain non-alphanumeric (unicode) characters: [nóvar]", function() {
			expect(runner._syntax.eval_text(
				'[nóvar]', tmp_var_store)).to.equal('[nóvar]');
		});

		it("Should parse variables with underscores and numbers: [my_var99]", function() {
			expect(runner._syntax.eval_text(
				'[my_var99]', tmp_var_store)).to.equal('99');
		});

		it("Should not try to parse a variable if it is preceded by a backslash: \\[width]", function() {
			expect(runner._syntax.eval_text(
				'\\[width]', tmp_var_store)).to.equal('[width]');
		});
		it("Should ignore characters between variable definitions: [width] x [height]", function() {
			expect(runner._syntax.eval_text(
				'[width] x [height]', tmp_var_store)).to.equal('1024 x 768');
		});
		it("Should process python code: [=10*10]", function() {
			expect(runner._syntax.eval_text(
				'[=10*10]', tmp_var_store)).to.equal('100');
		});
		it("Should not process python code if it is preceded by a backslash: \\[=10*10]", function() {
			expect(runner._syntax.eval_text(
				'\\[=10*10]', tmp_var_store)).to.equal('[=10*10]');
		});
		it('Should process string code: [="tést"]', function() {
			expect(runner._syntax.eval_text(
				'[="tést"]', tmp_var_store)).to.equal('tést');
		});
		it('Should process string code: [="\\[test\\]"]', function() {
			expect(runner._syntax.eval_text(
				'[="\\[test\\]"]', tmp_var_store)).to.equal('[test]');
		});
		it('Should process multiple variables: w: [width], h: [height]', function() {
			expect(runner._syntax.eval_text(
				'w: [width], h: [height]', tmp_var_store)).to.equal('w: 1024, h: 768');
		});
		it('Should process multiple code blocks: w: [=1024], h: [=768]', function() {
			expect(runner._syntax.eval_text(
				'w: [=1024], h: [=768]', tmp_var_store)).to.equal('w: 1024, h: 768');
		});
	});

	describe('compile_cond()', function() {
		it("Should convert a variable within [] to a variable name within the var context", function() {
			expect(runner._syntax.compile_cond(
				'[width] > 100', false)).to.equal('var.width > 100');
		});

		it("Should handle >= correctly", function() {
			expect(runner._syntax.compile_cond(
				'[width] >= 100', false)).to.equal('var.width >= 100');
		});

		it("Should handle <= correctly", function() {
			expect(runner._syntax.compile_cond(
				'[width] <= 100', false)).to.equal('var.width <= 100');
		});

		it("Should convert always to True", function() {
			expect(runner._syntax.compile_cond(
				'always', false)).to.equal(true);
		});
		it("Should convert ALWAYS to True", function() {
			expect(runner._syntax.compile_cond(
				'ALWAYS', false)).to.equal(true);
		});
		it("Should convert never to False", function() {
			expect(runner._syntax.compile_cond(
				'never', false)).to.equal(false);
		});
		it("Should convert NEVER to False", function() {
			expect(runner._syntax.compile_cond(
				'NEVER', false)).to.equal(false);
		});
		it("Should quote literals at the end of the string", function(){
			expect(runner._syntax.compile_cond(
				'[cue_side] = left', false)).to.equal('var.cue_side == "left"');
		});
		it("Should convert a single = to double ==", function() {
			expect(runner._syntax.compile_cond(
				'[width] = 1024', false)).to.equal('var.width == 1024');
		});
		it("Should handle underscores in variable names", function() {
			expect(runner._syntax.compile_cond(
				'[my_var99] = 1024', false)).to.equal('var.my_var99 == 1024');
		});
		it("Should handle lack of spaces surrounding = correctly", function() {
			expect(runner._syntax.compile_cond(
				'[width]=1024', false)).to.equal('var.width==1024');
		});
		it("Should not quote reserved words such as 'and' should also process double ==", function() {
			expect(runner._syntax.compile_cond(
				'[width] = 1024 and [height] == 768', false)).to.equal('var.width == 1024 and var.height == 768');
		});
		it("Should process a line starting with the = character as python script", function() {
			expect(runner._syntax.compile_cond(
				'=var.width > 100', false)).to.equal('var.width > 100');
		});
		it("Should ignore existing quotes and add new quotes", function() {
			expect(runner._syntax.compile_cond(
				'"yes" = yes', false)).to.equal('"yes" == "yes"');
		});
		it("Should process backslashes in a proper way", function() {
			expect(runner._syntax.compile_cond(
				'yes = \'yes\'', false)).to.equal('"yes" == \'yes\'');
		});
		it("Should process more complex structures with brackets", function() {
			expect(runner._syntax.compile_cond(
				'("a b c" = abc) or (x != 10) and ([width] == 100)', false)).to.equal('("a b c" == "abc") or ("x" != 10) and (var.width == 100)');
		});
	});
});
/*
if(!node_mode){
	describe('Canvas', function() {
			// Suppress error output
		var stub;
		beforeEach(function(){
			stub = sinon.stub(console, "error");
		});
		afterEach(function(){
			stub.restore();
		});

		var canvas = new Canvas({
			_runner: runner
		});

		it("should recognize valid HTML in a string", function() {
			expect(canvas._containsHTML("<p>Hey</p>")).to.be.true;
		});
		it("should recognize a string without html markup", function() {
			expect(canvas._containsHTML("Hey")).to.be.false;
		});
		it("should not mistake everything between < and > for html", function() {
			expect(canvas._containsHTML("a < b && b > c")).to.be.false;
		});
	

	

	// for colorspec in [
	// 	u'white',
	// 	u'#FFFFFF',
	// 	u'#ffffff',
	// 	u'#FFF',
	// 	u'#fff',
	// 	(255, 255, 255),
	// 	255,
	// 	u'rgb(255,255,255)',
	// 	u'rgb( 255 , 255 , 255 )',
	// 	u'rgb(100%,100%,100%)',
	// 	u'rgb( 100% , 100% , 100% )',
	// 	]:
	// 	print(u'Checking correct %s (%s)' % (str(colorspec), type(colorspec)))
	// 	self.assertEqual(u'#ffffff', color.to_hex(colorspec))

	// for colorspec in [
	// 	u'wihte',
	// 	u'#FFFFF',
	// 	u'#FFFFG',
	// 	(255,255,255.0),
	// 	(255, 255, 255, 255),
	// 	255.0,
	// 	u'rgb(255,255)',
	// 	u'rgb(255,255,255,255)',
	// 	u'rgb(100%,100%,100)',
	// 	]:
	// 	print(u'Checking incorrect %s (%s)' \
	// 		% (str(colorspec), type(colorspec)))
	// 	self.assertRaises(osexception, color.to_hex, colorspec)
	});
}
*/

describe('response', function() {
	// def assertState(self, response, response_time, correct, total_responses,
	// 	total_response_time, total_correct):

	// 	self.assertEqual(self.exp.var.response, response)
	// 	self.assertEqual(self.exp.var.response_time, response_time)
	// 	self.assertEqual(self.exp.var.correct, correct)
	// 	self.assertEqual(self.exp.var.total_responses, total_responses)
	// 	self.assertEqual(self.exp.var.total_response_time, total_response_time)
	// 	self.assertEqual(self.exp.var.total_correct, total_correct)

	// def runTest(self):

	// 	"""
	// 	desc:
	// 		Runs the response test.
	// 	"""

	// 	print(u'Checking response handling')
	// 	self.exp = experiment()
	// 	with self.assertRaises(osexception) as cm:
	// 		self.exp.set_response(correct=u'A')
	// 	with self.assertRaises(osexception) as cm:
	// 		self.exp.set_response(response_time=u'A')
	// 	for i in range(2):
	// 		self.exp.reset_feedback()
	// 		self.exp.set_response()
	// 		self.assertState(u'None', None, u'undefined', 1, 0, 0)
	// 		self.exp.set_response(response=u'A')
	// 		self.assertState(u'A', None, u'undefined', 2, 0, 0)
	// 		self.exp.set_response(response=u'B', response_time=1000)
	// 		self.assertState(u'B', 1000, u'undefined', 3, 1000, 0)
	// 		self.exp.set_response(response=u'C', response_time=1000, correct=1)
	// 		self.assertState(u'C', 1000, 1, 4, 2000, 1)
	// 		self.exp.set_response(response=u'D', response_time=1, correct=0)
	// 		self.assertState(u'D', 1, 0, 5, 2001, 1)

});
