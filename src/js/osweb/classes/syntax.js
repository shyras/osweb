import _ from 'underscore';

/** Class representing a syntax checker. */
export default class Syntax {
    /**
     * Create a syntax checker within OpenSesame.
     * @param {Object} runner - The runner to which the syntax checker belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._runner = runner; // Parent runner attached to the syntax class.    
    }

    /**
     * Compile a os condition for further processing.
     * @param {String} cnd - The condition to compile.
     * @param {Boolean} bytecode - The condition is converted to a python AST tree.
     * @return {string} - The compiled condition.
     */
    compile_cond(cnd, bytecode) {
        // Check for conditional paramters.
        bytecode = (typeof bytecode === 'undefined') ? true : bytecode;

        if (cnd === 'always') {
            return true;
        } else if (cnd == 'never') {
            return false;
        } else {
            if (cnd.substring(0, 1) == '=') {
                return this._runner._python._parse(cnd.substr(1));
            } else {
                cnd = cnd.replace(/[^(!=)][=]/g, '==');
            }
        }
        return cnd;
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
     * @param {Boolean} roundFloat - The variables used for evaluation.
     * @param {Object} variable - The variables used for evaluation.
     * @return {Boolean|Number|Object|String} - The result of the evaluated text.
     */
    eval_text(text, vars, roundFloat, variable) {
        // if pTxt is an object then it is a parsed python expression.
        if (_.isObject(text)) {
            return this._runner._pythonParser._run_statement(text);
        };
        // if pTxt is already a number simply return it
        if (_.isNumber(text)) {
            return text;
        }
        var result = text;
        var processing = result.search(/[^[\]]+(?=])/g);

        while (processing !== -1) {
            // Replace the found value with the variable.
            var variable = result.slice(processing, result.indexOf(']'));
            try{
                if ((typeof vars === 'undefined') || (typeof vars[variable] === 'undefined')) {
                    var value = this._runner._experiment.vars[variable];
                } else {
                    var value = vars[variable];
                }
            } catch (err) {
                this._runner._debugger.addError(`Could not find variable '${variable}': ${err.message}`);
            }

            // Temporyary hack for string types.
            if (typeof value === 'string') {
                result = result.replace('[' + variable + ']', "'" + value + "'");
                // result = result.replace('[' + variable + ']', value);
            } else {
                result = result.replace('[' + variable + ']', value);
            }
            processing = result.search(/[^[\]]+(?=])/g);
        }
        return result;
    }

    /**
     * Check if a value is a number.
     * @param {Number|String} n - The value to be checked.
     * @return {Boolean} - True if value is number.
     */
    isNumber(n) {
        return (Number(n) == n); // aangepast van == naar === en weer terug naar '==' anders werkt duration niet.
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
        if (Number.isNaN(Number(s))) {
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
     * Strip escape slashes from the given string. 
     * @param {String} line - The string to strip from escape backslashes
     * @return {String} - The stripped string.
     */
    strip_slashes(line) {
        return line.replace(/\\(.)/mg, "$1");
    }
}