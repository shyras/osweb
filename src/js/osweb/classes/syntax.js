"use strict";
/*
 * Definition of the class syntax.
 */

function syntax() {
  throw "The class syntax cannot be instantiated!";
};

/*
 * Definition of private class methods.   
 */

syntax._convertPython = function(pScript) {
  return pScript;
};


/**
 * Add escape slashes to the given string
 * @param  {string} str The string to escape.
 * @return {string}     The escaped string.
 */
syntax.add_slashes = function(str){
  return str.replace(/\\/g, '\\\\').
    replace(/\u0008/g, '\\b').
    replace(/\t/g, '\\t').
    replace(/\n/g, '\\n').
    replace(/\f/g, '\\f').
    replace(/\r/g, '\\r').
    replace(/'/g, '\\\'').
    replace(/"/g, '\\"');
}

syntax.isNumber = function(n) {
  return Number(n) == n; // aangepast van == naar === en weer terug naar '==' anders werkt duration niet.
};

syntax.isFloat = function(n) {
  return Number(n) === n && n % 1 !== 0;
};

syntax.remove_quotes = function(pString) {
  if (pString == '""') {
    return '';
  } else if ((pString[0] == '"') && (pString[pString.length - 1] == '"')) {
    return pString.slice(1, pString.length - 1);
  } else {
    return pString;
  }
};

/*
 * Definition of public class methods.   
 */

syntax.compile_cond = function(pCnd, pBytecode) {
  // Check for conditional paramters.
  pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;

  if (pCnd == 'always') {
    return true;
  } else if (pCnd == 'never') {
    return false;
  } else {
    if (pCnd.substring(0, 1) == '=') {
      // Python script, compile it to an ast tree.
      console.log('python script is not supported yet');
    } else {
      // opensesame script, convert it to javascript.
      pCnd = pCnd.replace(/[^(!=)][=]/g, '==');
    }
  }
  return pCnd;
};

/**
 * Converts a string to a float or integer if possible. If not, it returns the
 * original string. If passed a number the function also leaves it unaffected.
 * @param   val   The variable to convert to a number.
 * @return  an int or float if variable could be converted, original value otherwise.
 */
syntax.convert_if_numeric = function(val) {
  var res = Number(val);
  return Number.isNaN(res) ? val : res;
};

/**
 * Counts the quotes occuring inside the provided string.
 * This function is useful to determine if strings in a command are property closed.
 * Propertly closed strings should always result in an equal number of counted quotes
 * (where escaped quotes of course are disregarded)
 * @param  {string} str The string to count the quotes in.
 * @return {int}     The number of quotes counted.
 */
syntax.count_quotes = function(s){
  var res = 0;
  var in_entity = false;
  for (var i=0; i<s.length; i++) {
    if ((s[i] === '\\' && !in_entity) || in_entity) { // reverse the flag 
       in_entity = !in_entity;
    } else if (s[i] === '"'  && !in_entity) { // an unescaped "
        res += 1;
    }
  }
  return res;
}

/**
 * Evaluates variables and inline Python in a text string.
 * @param  {[type]} pTxt         [description]
 * @param  {[type]} pVars        [description]
 * @param  {[type]} pRound_float [description]
 * @param  {[type]} pVar         [description]
 * @return {[type]}              [description]
 */
syntax.eval_text = function(pTxt, pVars, pRound_float, pVar) { 
  // if pTxt is already a number simply return it
  if (typeof(pTxt) == "number") {
    return pTxt;
  }
  var result = pTxt;
  var processing = result.search(/[^[\]]+(?=])/g);

  while (processing != -1) {
    // Replace the found value with the variable.
    var variable = result.slice(processing, result.indexOf(']'));

    if (typeof pVars === 'undefined') {
      var value = osweb.runner.experiment.vars[variable];
    } else {
      var value = pVars[variable];
    }

    result = result.replace('[' + variable + ']', value);
    processing = result.search(/[^[\]]+(?=])/g);
  }

  return result;
};

/**
 * Wraps and escapes a text so that it can safely be embedded in a
      command string. For example:
      He said: "hi"
      would become:
      "He said: \"hi\""
 * @param  {string} s The string to wrap
 * @return {string}   The wrapped string
 */
syntax.safe_wrap = function(s){
  // If s is a number, return untouched.
  if(Number.isNaN(Number(s))){
    //see if there are any non-alphanumeric characters.
    //Wrap the value in quotes if so.
    if(/[^a-z0-9_]/i.test(s)){
      s = "\"" + this.add_slashes(s) + "\"";
    }
  }else{
    s = Number(s);
  }
  return s;
}

/**
 * Builds up a command string from the supplied arguments
 * @param  {string} cmd    The command (e.g. set, widget, run)
 * @param  {array} args   List of arguments
 * @param  {object} kwargs keyword arguments
 * @return {string}        The resulting command string
 */
syntax.create_cmd = function(cmd, args, kwargs){
  var result = cmd;
  if(typeof(args) !== "undefined" && args instanceof Array && args.length > 0){
    for(var i=0; i<args.length; i++){
      result += " " + this.safe_wrap(args[i]);
    }
  }
  if(typeof(kwargs) !== "undefined" && args instanceof Object){
    for(var key in kwargs){
      result += " " + key + "=" + this.safe_wrap(kwargs[key]);
    }
  }
  return result;
}

/**
 * Parses an instruction line of OpenSesame script
 * @param  {string} pString The line to parse
 * @return {[array]}  An array with [the command, [list of args], {object with keyword arguments}]
 */ 
syntax.parse_cmd = function(pString) {
  // Check if quoted strings are properly closed.
  if(this.count_quotes(pString)%2 !== 0){
    //Unequal number of quotes detected. Can't be right.
    throw Error(osweb.constants.ERROR_008 + " '" + pString + "'");
  }

  // split the pString.
  var tokens = this.split(pString);
  var cmd = tokens.shift();
  var args = [];
  var kwargs = {};

  for(var i=0; i<tokens.length; i++){
    var value = tokens[i];
    // Monster regex, splits into key/value pair any occurrence of:
    // 
    // a=some_var_value_including_underscores_and_d1g1ts
    // a="some string with spaces or any chars. \" escaped slashes are ignored"
    // a=100 (or any number format, including negative and float numbers)
    // "Strings with = are ignored and returned as a single string"
    // 
    // Shorter but less powerfull version concerning numbers is:
    // /(?:("(?:[^"\\]|.)*"))|(?:(\w+)=(?:([\w-.]+)|("(?:[^"\\]|.)*"))/gm
    // Also allows things as x=33423-342...333. The one used below guards for this
    // and the (-?\d*\.{0,1}\d+) part makes sure numbers have a legal format.
    
    // Check if string is properly quoted (i.e. has opening and closing quotes)
    // Do this by counting the number of quotes, which should be an equal number (excluding escaped quotes)
    var parsed = value.split(/(?:("[^"\\]*(?:\\.[^"\\]*)*"))|(?:(\w+)=(?:(?:(-?\d*\.{0,1}\d+)|(\w+))|("[^"\\]*(?:\\.[^"\\]*)*")))/gm).filter(Boolean);
    
    // parsed will have length 1 if the variable has no keyword, and will be
    // of length 2 (split over the = symbol) if the variable had a keyword
    if(parsed.length < 2){
      args.push(this.convert_if_numeric(this.sanitize(parsed[0])));
    } else {
      kwargs[parsed[0]] = this.convert_if_numeric(this.sanitize(parsed[1]));
    }
  }

  return [cmd, args, kwargs];
};

/**
 * Strips escape slashes from the given string
 *
 * @param  {string} str The string to strip from escape backslashes
 * @return {string}     The stripped string.
 */
syntax.strip_slashes = function(str){
  return str.replace(/\\(.)/mg, "$1");
}

syntax.sanitize = function(pString, pStrict, pAllowVars) {
  // Removes invalid characters (notably quotes) from the string.
  //remove quotes
  pString = pString.replace(/^"(.+(?="$))"$/, '$1');
  return this.strip_slashes(pString);
};

/**
 * Return an array with tokens ignoring whitespaces within.
 * 
 * Another option is to use the regexp
 * (?:("[^"\\]*(?:\\.[^"\\]*)*"))|(?:(\w+)=(?:(?:(-?\d*\.{0,1}\d+)|(\w+))|("[^"\\]*(?:\\.[^"\\]*)*")))|(\w+)
 * which would parse everything correctly in one go (thus nullifying the need for syntax.split).
 * 
 * @param  {string} pLine the line to split in tokens
 * @return {array}       the list of tokens
 */
syntax.split = function(pLine) {
  var result = pLine.match(/(?:[^\s"]+|"[^"]*")+/g);
  return (result != null) ? result : [];
};

// Bind the syntax class to the osweb namespace.
module.exports = syntax;