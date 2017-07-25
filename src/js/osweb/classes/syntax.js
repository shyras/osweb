import { isNumber, isObject, isString }  from 'underscore';

/** Class representing a syntax checker. */
export default class Syntax {
    /**
     * Create a syntax checker within OpenSesame.
     * @param {Object} runner - The runner to which the syntax checker belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._runner = runner; // Parent runner attached to the syntax class.
        this.isNumber = isNumber; // attach underscore function to class;    
    }

    /**
     * Compile a os condition for further processing.
     * @param {String} cnd - The condition to compile.
     * @param {Boolean} bytecode - The condition is converted to a python AST tree.
     * @return {String} - The compiled condition.
     */
    compile_cond(cnd, bytecode) {
        // Check for conditional paramters.
        bytecode = (typeof bytecode === 'undefined') ? true : bytecode;

        if (cnd.toLowerCase() === 'always') {
            return true;
        } else if (cnd.toLowerCase() === 'never') {
            return false;
        } else {
            if (cnd[0] === '=') {
                cnd = cnd.substr(1);
            } else {
                cnd = this.remove_quotes(cnd);
                // Scan for literals (strings, numbers, etc).
                cnd = cnd.replace(/(?!(?:and|or|not)\b)(?:".*?"|'.*?'|\[(?:\w+?|=.+)\]|\b\w+\b)/g , (match, offset, string) => {
                    if (string[offset] == '[' && string[offset+match.length-1] == ']') {
                        // Check if match is a variable.
                        if (string[offset-1] == "\\" && string[offset-2] != "\\") {
                            // Check if the current match is escaped, and simpl\w+?|=.+y return it untouched if so.
                            return `"${match}"`;
                        }
                        // Check if the variable contains a Python expression
                        if (match[1] == "=") {
                            const expression = match.substring(2, match.length-1);
                            const ast = this._runner._pythonParser._parse(expression);
                            return this._runner._pythonParser._run_statement(ast);
                        }

                        // Return the var. notation otherwise
                        const content = match.substring(1,match.length-1);
                        return `var.${content}`;
                    } else if ([`"`,`'`].includes(string[offset]) && 
                        string[offset] == string[offset+match.length-1]) {
                        // Check if match is between quotes. Don't do anything then
                        return match;
                    } else if (!Number.isNaN(Number(match))) {
                        return Number(match);
                    } else {
                        return `"${match}"`;
                    }
                });

                // Handle operators.
                cnd = cnd.replace(/([^!<>\=\-+*])(=)([^=])/g, '$1==$3');
            }
        }
        if (bytecode === true) {
            return this._runner._pythonParser._parse(cnd);
        } else {
            return cnd;
        }
    }

    /**
     * Converts a string to a float or integer if possible.
     * @param {String|Number} value -The variable to convert to a number.
     * @return {String|Number} - An number or float if variable could be converted, original value otherwise.
     */
    convert_if_numeric(value) {
        var result = Number(value);
        return Number.isNaN(result) ? value : result;
    }

    /**
     * Counts the quotes occuring inside the provided string.
     * @param {String} line - The string line to count the quotes in.
     * @return {Number} - The number of quotes counted.
     */
    count_quotes(line) {
        var res = 0;
        var in_entity = false;
        for (var i = 0; i < line.length; i++) {
            if ((line[i] === '\\' && !in_entity) || in_entity) { // reverse the flag 
                in_entity = !in_entity;
            } else if (line[i] === '"' && !in_entity) { // an unescaped "
                res += 1;
            }
        }
        return res;
    }

    /**
     * Evaluate a given text with optional variable definitions.
     * @param {Boolean|Number|Object|String} txt - The text to evaluate.
     * @param {Object} vars - The variables used for evaluation.
     * @param {Boolean} addQuotes - The add quotes toggle.
     * @return {Boolean|Number|Object|String} - The result of the evaluated text.
     */
    eval_text(text, vars, addQuotes) {
        // if pTxt is an object then it is a parsed python expression.
        if (isObject(text)) {
            return this._runner._pythonParser._run_statement(text);
        };
        // if pTxt is already a number simply return it
        if (isNumber(text)) {
            return text;
        }

        text = this.escapeBrackets(text);
        /** The replacer function detects variable entries in the passed text
        and replaces them with variable values as found in OpenSesame's var store */
        let result = text.replace(/\[(\w+|=.+?)\]/g, (match, content, offset, string) => {
            // Check if contents of [] start with an =. In this case they should be
            // evaluated as a Python statement
            content = this.unescapeBrackets(content);
            if (content[0] === '=') {
                // Convert python statement to ast tree and run it.
                const ast = this._runner._pythonParser._parse(content.substring(1, content.length));
                return this._runner._pythonParser._run_statement(ast);
            } else {
                try {
                    if ((vars === null) || (typeof vars[content] === 'undefined')) {
                        var value = this._runner._experiment.vars[content];
                    } else {
                        var value = vars[content];
                    }
                } catch (err) {
                    this._runner._debugger.addError(`Could not find variable '${content}': ${err.message}`);
                }

                if (addQuotes === true) {
                    // Temporyary hack for string types.
                    return isString(value) ? `"${value}"` : value;
                } else {
                    return value;    
                }
            }
        });

        // Check if contenst has additional quotes
        return this.strip_slashes(this.unescapeBrackets(result));
    }

    /**
     * Wraps and escapes a text so that it can safely be embedded in a
          command string. For example:
          He said: "hi"
          would become:
          "He said: \"hi\""
     * @param  {string} s The string to wrap
     * @return {string}   The wrapped string
     */
    safe_wrap(s) {
        // If s is a number, return untouched.
        if (!isNumber(s)) {
            //see if there are any non-alphanumeric characters.
            //Wrap the value in quotes if so.
            if (/[^a-z0-9_]/i.test(s)) {
                s = "\"" + this.add_slashes(s) + "\"";
            }
        } else {
            s = Number(s);
        }
        return s;
    }

    /**
     * Add escape slashes to the given string
     * @param  {string} str The string to escape.
     * @return {string}     The escaped string.
     */
    add_slashes(str) {
        return str.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
    }

    /** 
     * Strip escape slashes from the given string. 
     * @param {String} line - The string to strip from escape backslashes
     * @return {String} - The stripped string.
     */
    strip_slashes(line) {
        return line.replace(/\\(.)/mg, "$1");
    }

    /**
     * Parses an instruction line of OpenSesame script
     * @param {String} line - The line to parse
     * @return {Array} - An array with command, list of arguments and an object with keyword arguments.
     */
    parse_cmd(line) {
        // Check if quoted strings are properly closed.
        if (this.count_quotes(line) % 2 !== 0) {
            //Unequal number of quotes detected. Can't be right.
            this._runner._debugger.addError('Invalid script definition, parsing error: ' + " '" + line + "'");
        }

        // Split the string line.
        var tokens = this.split(line);
        var cmd = tokens.shift();
        var args = [];
        var kwargs = {};

        for (var i = 0; i < tokens.length; i++) {
            var value = tokens[i];
            // Monster regex, splits into key/value pair.
            var parsed = value.split(/(?:("[^"\\]*(?:\\.[^"\\]*)*"))|(?:(\w+)=(?:(?:(-?\d*\.{0,1}\d+)|(\w+))|("[^"\\]*(?:\\.[^"\\]*)*")))/gm).filter(Boolean);

            // parsed will have length 1 if the variable has no keyword, and will be
            // of length 2 (split over the = symbol) if the variable had a keyword
            if (parsed.length < 2) {
                args.push(this.convert_if_numeric(this.sanitize(parsed[0])));
            } else {
                kwargs[parsed[0]] = this.convert_if_numeric(this.sanitize(parsed[1]));
            }
        }
        return [cmd, args, kwargs];
    }

    create_cmd(cmd, args, kwargs) {
        var result = cmd;
        if (typeof(args) !== "undefined" && args instanceof Array && args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                result += " " + this.safe_wrap(args[i]);
            }
        }
        if (typeof(kwargs) !== "undefined" && args instanceof Object) {
            for (var key in kwargs) {
                result += " " + key + "=" + this.safe_wrap(kwargs[key]);
            }
        }
        return result;
    }

    /**
     * Remove additional quotes from a string line.
     * @param {String} line - The string width additional quotes.
     * @return {String} - Updated string.
     */
    remove_quotes(line) {
        if (line === '""') {
            return '';
        } else if ((line[0] === '"') && (line[line.length - 1] === '"')) {
            return line.slice(1, line.length - 1);
        } else if ((line[0] === "'") && (line[line.length - 1] === "'")) {
            return line.slice(1, line.length - 1);
        } else {
            return line;
        }
    }

    /** 
     * Remove invalid characters (notably quotes) from the string.
     * @param {String} line - The string to restrecut.
     * @param {Boolean} strict - If true use strict conversion (not implemented yet).
     * @param {Boolean} allowVars -If true allow variable definitions in the string (not implemented yet).
     * @return {String} - The restructured string.
     */
    sanitize(line, strict, allowVars) {
        // Replace quotes.
        line = line.replace(/^"(.+(?="$))"$/, '$1');

        // Replace slashed and return result.
        return this.strip_slashes(line);
    }

    /**
     * Return an array with tokens ignoring whitespaces within.
     * @param {String} line - line the line to split in tokens
     * @return {Array} - The list of tokens
     */
    split(line) {
        var result = line.match(/(?:[^\s"]+|"[^"]*")+/g);
        return (result !== null) ? result : [];
    }
    
    /**
     * Replaces all escaped brackets by a placeholder string of the format
     * `%%OPEN:1:%%`
     * @param {String} text - The text to escape.
     * @return {String} - The escaped text.
     */
    escapeBrackets(text) {
    
        let result = text.replace(/\\+[\[\]]/g, (match, content, offset, str) => {
            let n_brackets = match.length-1;
            if (n_brackets % 2 == 1) {
                let chartype = match[match.length-1] == '[' ? 'OPEN' : 'CLOSE';
                return `%%${chartype}:${n_brackets}:%%`;
            }
            return match;
        })
        return result;
    }
    
    /**
     * Replaces all placeholder strings by escaped brackets.
     * `%%OPEN:1:%%`
     * @param {String} text - The text to unescape.
     * @return {String} - The unescaped text.
     */	
    unescapeBrackets(text) {
    
        let result = text.replace(/%%(OPEN|CLOSE):\d+:%%/g, (match, content, offset, str) => {		
            let chartype = match.substr(2,4) == 'OPEN' ? '[' : ']';
            let i1 = match.indexOf(':')+1;
            let i2 = match.lastIndexOf(':');
            let n_brackets = parseInt(match.substr(i1, i2-i1));
            return Array(n_brackets).join('\\') + chartype;
        })
        return result;	
    }
    
}
 
