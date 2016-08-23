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
 * Parses an instruction line of OpenSesame script
 * @param  {string} pString The line to parse
 * @return {[array]}  An array with [the command, [list of args], {object with keyword arguments}]
 */ 
syntax.parse_cmd = function(pString) {
  // split the astring.
  var tokens = this.split(pString);
  var cmd = tokens.shift();
  var args = [];
  var kwargs = {};

  tokens.forEach((function(value, key, tokens) {
    // parsed will have length 1 if the variable has no keyword, and will be
    // of length 2 (split over the = symbol) if the variable had a keyword
    var parsed = value.split(/("(?:[^"\\]|.)*")|(\w+)=(.+?)(?= \w+=|$)/gm).filter(Boolean);

    if(parsed.length < 2){
      args.push(this.convert_if_numeric(this.sanitize(parsed[0])));
    } else {
      kwargs[parsed[0]] = this.convert_if_numeric(this.sanitize(parsed[1]));
    }
  }).bind(this));

  return [cmd, args, kwargs];
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

syntax.sanitize = function(pString, pStrict, pAllowVars) {
  // Removes invalid characters (notably quotes) from the string.
  //remove quotes
  pString = pString.replace(/^"(.+(?="$))"$/, '$1');

  //replace escaped characters
  pString = pString.replace(/\\"/g, '"');
  return pString;
};

syntax.split = function(pLine) {
  // Return an array with tokens ignoring whitespaces within. 
  var result = pLine.match(/(?:[^\s"]+|"[^"]*")+/g);
  return (result != null) ? result : [];
};

// Bind the syntax class to the osweb namespace.
module.exports = syntax;