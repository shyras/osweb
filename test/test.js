var node_mode = false;
if(typeof(require) != "undefined"){
	var node_mode = true;
}

if(node_mode){
	var osweb = require("../public_html/js/osweb");
	var expect = require("chai").expect;
}else{
	var expect = chai.expect;
}

describe('syntax', function(){
	var checkCmd = function(s, cmd, arglist, kwdict ){
		// parse command into arguments
		[_cmd, _arglist, _kwdict] = osweb.syntax.parse_cmd(s);
		expect(_cmd).to.equal(cmd);
		expect(_arglist).to.deep.equal(arglist);
		expect(_kwdict).to.deep.equal(kwdict);
		// translate arguments back to command
		//expect(s).to.equal(osweb.syntax.create_cmd(_cmd, _arglist, _kwdict));
	}

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

	it("should be able to handle spaces in quoted string variable values", function(){
		checkCmd('draw fixdot color="#ff000b" show_if="[correct] = 0" x=0 y=0',
			'draw', ['fixdot'], {color: "#ff000b", show_if: "[correct] = 0", x:0, y:0});
	});

	it("should be able to handle escaped backslashes", function(){
		checkCmd('test "\\"quoted\\""',
			'test', ['\"quoted\"'], {});
	});

	it("should be able to handle escaped backslashes in keyword arguments", function(){
		checkCmd('test test="\\"quoted\\""', 'test', [],
			{'test' : '\"quoted\"'});
	});

	it("should throw an exception when syntax can't be parsed", function(){
		expect(function(){
			self.checkCmd('widget 0 0 1 1 label text="Tést 123',
				'widget', [0, 0, 1, 1, 'label'],
				{'text' : 'Tést 123'})
		}).to.throw();
	})
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
});