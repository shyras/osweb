var node_mode = false;
if(typeof(require) != "undefined"){
	var node_mode = true;
}

if(node_mode){
	// Refer to the source code, as node can import all modules on its own and
	// doesn't need the all-in-one js module.
	var osweb = require("../src/js/osweb/main.js");
	var expect = require("chai").expect;
}else{
	var expect = chai.expect;
}

var Script = '---' + '\n' +
	 'API: 2' + '\n' +
	 'OpenSesame: 3.0.2' + '\n' +
	 'Platform: nt' + '\n' +
	 '---' + '\n' +
	 'set width 1024' + '\n' +
	 'set uniform_coordinates "yes"' + '\n' +
	 'set title "New experiment"' + '\n' +
	 'set subject_parity "even"' + '\n' +
	 'set subject_nr 0' + '\n' +
	 'set start "block"' + '\n' +
	 'set height 768' + '\n' +
	 'set foreground "white"' + '\n' +
	 'set description "Default description"' + '\n' +
	 'set coordinates "uniform"' + '\n' +
	 'set compensation 0' + '\n' +
	 'set canvas_backend "xpyriment"' + '\n' +
	 'set background "black"' + '\n' +
	 '' + '\n' +
	 'define sequence block' + '\n' +
	 '	set flush_keyboard "yes"' + '\n' +
	 '	set description "Runs a number of items in sequence"' + '\n' +
	 '	run new_loop always' + '\n' +
	 '' + '\n' +
	 'define loop new_loop' + '\n' +
	 '	set skip 0' + '\n' +
	 '	set repeat 1' + '\n' +
	 '	set order "sequential"' + '\n' +
	 '	set offset "no"' + '\n' +
	 '	set item "trial"' + '\n' +
	 '	set description "Repeatedly runs another item"' + '\n' +
	 '	set cycles 2' + '\n' +
	 '	set column_order "stimulus;counter"' + '\n' +
	 '	set break_if "never"' + '\n' +
	 '	setcycle 0 stimulus "page 1<br/><br/>Next line"' + '\n' +
	 '	setcycle 0 counter "1"' + '\n' +
	 '	setcycle 1 stimulus "page 2"' + '\n' +
	 '	setcycle 1 counter "2"' + '\n' +
	 '	setcycle 2 stimulus "page 3"' + '\n' +
	 '	setcycle 2 counter "3"' + '\n' +
	 '	run trial' + '\n' +
	 '' + '\n' +
	 'define sequence trial' + '\n' +
	 '	set flush_keyboard "yes"' + '\n' +
	 '	set description "Runs a number of items in sequence"' + '\n' +
	 '	run welcome always' + '\n' +
	 '' + '\n' +
	 'define sketchpad welcome' + '\n' +
	 '	set start_response_interval "no"' + '\n' +
	 '	set reset_variables "no"' + '\n' +
	 '	set duration "keypress"' + '\n' +
	 '	set description "Displays stimuli"' + '\n' +
	 '	draw textline center=1 color=white font_bold=no font_family=serif font_italic=no font_size=32 html=yes show_if=always text="OpenSesame 3.0.0 [stimulus]" x=0 y=0 z_index=0' + '\n';
        
        // Definition of the experiment object and its properties.
var Experiment = {'source': Script};

describe('syntax', function(){
	describe('parse_cmd()', function(){
		var checkCmd = function(s, cmd, arglist, kwdict ){
			// parse command into arguments
			[_cmd, _arglist, _kwdict] = osweb.syntax.parse_cmd(s);
			expect(_cmd).to.equal(cmd);
			expect(_arglist).to.deep.equal(arglist);
			expect(_kwdict).to.deep.equal(kwdict);
			// translate arguments back to command
			expect(s).to.equal(osweb.syntax.create_cmd(_cmd, _arglist, _kwdict));
		};

		it("should parse command with arguments and keyword arguments", function(){
			checkCmd('widget 0 0 1 1 label text="Tést 123"',
				'widget', [0, 0, 1, 1, 'label'],
				{'text' : 'Tést 123'});
		});

		it("should parse a single command with no arguments", function(){
			checkCmd('test', 'test', [], {});
		});

		it("should parse command with escaped backslashes", function(){
			checkCmd('set test "c:\\\\" x="d:\\\\"',
				'set', ['test', 'c:\\'], {'x' : 'd:\\'});
		});

		it("should ignore/not parse contents quoted keyword argument values", function(){
			checkCmd('draw fixdot color="#ff000b" show_if="[correct] = 0" x=0 y=0',
				'draw', ['fixdot'], {color: "#ff000b", show_if: "[correct] = 0", x:0, y:0});
		});

		it("should not parse contents of a (non-keyword arg) string value", function(){
			checkCmd('run correct_sound "[correct]=1"',
				'run', ['correct_sound','[correct]=1'], {});
		});

		it("should be able to handle escaped backslashes", function(){
			checkCmd('test "\\"quoted\\""',
				'test', ['\"quoted\"'], {});
		});

		it("should be able to handle escaped backslashes in keyword arguments", function(){
			checkCmd('test test="\\"quoted\\""', 'test', [],
				{'test' : '\"quoted\"'});
		});

		it("should throw an exception when string can't be parsed", function(){
			expect(function(){
				checkCmd('widget 0 0 1 1 label text="Tést 123',
					'widget', [0, 0, 1, 1, 'label'],
					{'text' : 'Tést 123'});
			}).to.throw();
		});
	});

	describe('eval_text()', function(){
		var tmp_var_store = new osweb.var_store(this, null);
		tmp_var_store.set('width',1024);
		tmp_var_store.set('height',768);

            
        it("Should only parse real variables", function(){
			expect(osweb.syntax.eval_text(
				'\\\\[width] = \\[width] = [width]', tmp_var_store)).to.equal('\[width] = [width] = 1024');
		});

		it("Should not try to parse a variable if [] contents contain spaces", function(){
			expect(osweb.syntax.eval_text('[no var]', tmp_var_store)).to.equal('[no var]');
		});

		it("Should not try to parse a variable if [] contents contain non-alphanumeric (unicode) characters", function(){
			expect(osweb.syntax.eval_text(
				'[nóvar]', tmp_var_store)).to.equal('[nóvar]');
		});

		it("Should not try to parse a variable if it is preceded by a slash", function(){
			expect(osweb.syntax.eval_text(
				'\[width]', tmp_var_store)).to.equal('[width]');
		});

		it("Should ignore characters between variable definitions", function(){
			expect(osweb.syntax.eval_text(
				'[width] x [height]', tmp_var_store)).to.equal('1024 x 768');
		});

		it("Should process python code: [=10*10]", function(){
			expect(osweb.syntax.eval_text(
				'[=10*10]', tmp_var_store)).to.equal('100');
		});

		it("Should not process python code if if is preceded by a slash: /[=10*10]", function(){
			expect(osweb.syntax.eval_text(
				'/[=10*10]', tmp_var_store)).to.equal('[=10*10]');
		});

		it('Should process string code: [="tést"]', function(){
			expect(osweb.syntax.eval_text(
				'[="tést"]', tmp_var_store)).to.equal('tést');
		});

		it('Should process string code: [="\[test\]"]', function(){
			expect(osweb.syntax.eval_text(
				'[="\[test\]"]', tmp_var_store)).to.equal('[test]');
		});
	});

	describe('compile_cond()', function(){
		it("Should convert a variable within [] to a variable name within the var context", function(){
			expect(osweb.syntax.compile_cond_new(
				'[width] > 100',false)).to.equal('var.width > 100');
		});
		it("Should convert always to True", function(){
			expect(osweb.syntax.compile_cond_new(
				'always',false)).to.equal('True');
		});
		it("Should convert ALWAYS to True", function(){
			expect(osweb.syntax.compile_cond_new(
				'ALWAYS',false)).to.equal('True');
		});
		it("Should convert never to False", function(){
			expect(osweb.syntax.compile_cond_new(
				'never',false)).to.equal('False');
		});
		it("Should convert NEVER to False", function(){
			expect(osweb.syntax.compile_cond_new(
				'NEVER',false)).to.equal('False');
		});
                it("Should convert numbers to numbers", function(){
			expect(osweb.syntax.compile_cond_new(
				'[width] = 1024',false)).to.equal('var.width == 1024');
		});
                it("Should not quote reserved words such as and and should also process double ==", function(){
			expect(osweb.syntax.compile_cond_new(
				'[width] == 1024 and [height] == 768',false)).to.equal('var.width == 1024 and var.height == 768');
		});
                it("Should process a line starting with the = character as python script", function(){
			expect(osweb.syntax.compile_cond_new(
				'=var.width > 100',false)).to.equal('var.width > 100');
		});
                it("Should igonere existing quotes and add new quotes", function(){
			expect(osweb.syntax.compile_cond_new(
				'"yes" = yes',false)).to.equal('"yes" == "yes"');
		});
                it("Should process backslashes in a proper way", function(){
			expect(osweb.syntax.compile_cond_new(
				'yes = \'yes\'',false)).to.equal('"yes" == \'yes\'');
		});
                it("Should process more complex structures with brackets", function(){
			expect(osweb.syntax.compile_cond_new(
				'("a b c" = abc) or (x != 10) and ([width] == 100)',false)).to.equal('("a b c" == "abc") or ("x" != 10) and (var.width == 100)');
		});
	});
});

describe('canvas', function(){
	if(!node_mode){
		it("should recognize valid HTML in a string", function(){
			expect(osweb.canvas.prototype._containsHTML("<p>Hey</p>")).to.be.true;
		});
		it("should recognize a string without html markup", function(){
			expect(osweb.canvas.prototype._containsHTML("Hey")).to.be.false;
		});
		it("should not mistake everything between < and > for html", function(){
			expect(osweb.canvas.prototype._containsHTML("a < b && b > c")).to.be.false;
		});
	}

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

describe('response', function(){
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