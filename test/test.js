var osweb = require("../public_html/js/osweb");
var expect = require("chai").expect;
var should = require('should');

describe('osweb', function(){
	describe('syntax', function(){
		var checkCmd = function( s, cmd, arglist, kwdict ){
			// parse command into arguments
			result = osweb.syntax.parse_cmd(s);
			console.log("'" + s + "'" + " becomes [" + result + "]");
			expect(cmd).to.equal(_cmd);
			expect(arglist).to.deep.equal(_arglist);
			expect(kwdict).to.deep.equal(_kwdict);
			// translate arguments back to command
			expect(s).to.equal(osweb.syntax.create_cmd(_cmd, _arglist, _kwdict));
		}

		it("should parse command with arguments and keyword arguments", function(){
			checkCmd('widget 0 0 1 1 label text="Tést 123"',
				'widget', [0, 0, 1, 1, 'label'],
				{'text' : 'Tést 123'});
		});

		it("should parse a single command with no arguments", function(){
			checkCmd('test', 'test', [], {});
		});

		it("should parse a set variable command", function(){
			checkCmd('set test "c:\\\\" x="d:\\\\"',
				'set', ['test', 'c:\\'], {'x' : 'd:\\'});
		});

		it("should be able to handle quotes", function(){
			checkCmd('test "\\"quoted\\""',
				'test', ['\"quoted\"'], {});
		});

		it("should be able to handle quotes in keyword arguments", function(){
			checkCmd('test test="\\"quoted\\""', 'test', [],
				{'test' : '\"quoted\"'});
		});

		it("should throw an exception when syntax can't be parsed", function(){
			(function(){
				self.checkCmd('widget 0 0 1 1 label text="Tést 123',
					'widget', [0, 0, 1, 1, 'label'],
					{'text' : 'Tést 123'})
			}).should.throw();
		})
	});
});