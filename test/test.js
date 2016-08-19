var osweb = require("../tmp/osweb");
var expect = require("chai").expect;
var should = require('should');

describe('osweb.syntax', function(){
	it("parse_cmd: Check whether OpenSesame syntax is correctly parsed", function(){
		function checkCmd( s, cmd, arglist, kwdict ){
			// parse command into arguments
			[_cmd, _arglist, _kwdict] = osweb.syntax.parse_cmd(s)
			expect(cmd).to.equal(_cmd);
			expect(arglist).to.deep.equal(_arglist);
			expect(kwdict).to.deep.equal(_kwdict);
			// translate arguments back to command
			expect(s).to.equal(osweb.syntax.create_cmd(_cmd, _arglist, _kwdict));
		}
		checkCmd('widget 0 0 1 1 label text="Tést 123"',
			'widget', [0, 0, 1, 1, 'label'],
			{'text' : 'Tést 123'})
		checkCmd('test', 'test', [], {})
		checkCmd('set test "c:\\\\" x="d:\\\\"',
			'set', ['test', 'c:\\'], {'x' : 'd:\\'})
		checkCmd('test "\\"quoted\\""',
			'test', ['\"quoted\"'], {})
		checkCmd('test test="\\"quoted\\""', 'test', [],
			{'test' : '\"quoted\"'})
		(function(){
			console.log('Testing exception ...')
			self.checkCmd('widget 0 0 1 1 label text="Tést 123',
				'widget', [0, 0, 1, 1, 'label'],
				{'text' : 'Tést 123'})
		}).should.throw();
	})
});