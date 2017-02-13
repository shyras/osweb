module.exports = function(osweb){
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

  syntax.compile_cond_new = function(pCnd, pBytecode) {
      // Check for conditional paramters.
      pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;
      
      if (pCnd.substring(0, 1) == '=') {
          // Remove the first character.
          pCndResult = pCnd.substr(1);
      }
      else {
          
          // Translate the condition 
          var i = 0;
          var in_quote = false;
          var in_var = false;
          var in_var_pos = 0;
          var in_special = false;
          var symbol_start = false;
          var pCndResult = '';
          // Remove first and last quote if present.
          if (((pCnd[0] === '"') || (pCnd[0] === "'")) && ((pCnd[pCnd.length - 1] === '"') || (pCnd[pCnd.length - 1] === "'"))) {
              pCnd = pCnd.slice(1, pCnd.length - 1);
          }

          // Parse through the condition.
          for (var i = 0;i < pCnd.length;i++) {
              // Ignore slashes                 
              if (pCnd[i] === '\\') {
                  continue;
              } 
              if ((pCnd[i] === '"') || (pCnd[i] === "'")) {
                  // Toggle the in_quote.
                  in_quote = !(in_quote);
                  
                  // Add element to result string
                  pCndResult = pCndResult + pCnd[i];

                  // Continue the parsing.
                  continue;
              } 
              // Check for start variables.
              if ((pCnd[i] === '[') && (in_quote === false)) {
                  // Toggle the in_var.
                  in_var = true;
                  // preserve position.
                  in_var_pos = i;
                  // Continue the parsing.
                  continue;
              }
              // Check for end var.
              if ((pCnd[i] === ']') && (in_quote === false) && (in_var === true)) {
                  // Toggle the in_var.
                  in_var = false;
                  
                  // Replace the var for valid name.
                  pCndResult = pCndResult + 'var.' + pCnd.substring(in_var_pos + 1, i);

                  // Continue the parsing.
                  continue;
              }
              // Check for symbol 
              if ((in_quote === false) && (in_var === false)) {
                  if (symbol_start === false) {
                      if (pCnd[i].search(/^[a-z0-9]+$/i) === -1) {
                          if ((pCnd[i] === '=') && (pCnd[i - 1] !== '!') && (pCnd[i - 1] !== '=') && (pCnd[i + 1] !== '=')) {
                              pCndResult = pCndResult + pCnd[i] + '=';
                          } 
                          else {
                              pCndResult = pCndResult + pCnd[i];
                          }
                      }
                      else {
                          // Toggle the in_symbol.
                          symbol_start = true; 
                          // preserve position.
                          in_var_pos = i;
                      } 
                  }
                  else {
                      // Check for closure of symbol.
                      if ((pCnd[i].search(/^[a-z0-9]+$/i) === -1) || (i == pCnd.length - 1)) {
                          // Toggle the in_quote.
                          var symbol = ((i == pCnd.length - 1) && (pCnd[i].search(/^[a-z0-9]+$/i) !== -1))? pCnd.substring(in_var_pos,i + 1) : pCnd.substring(in_var_pos,i);
                          symbol_start = false;                
                          // Check if the symbol is a numeric value.
                          if (((!isNaN(parseFloat(symbol)) && isFinite(symbol)) === false) &&
                              ((symbol.toLowerCase() !== 'always') && (symbol.toLowerCase() !== 'never') && (symbol !== 'and') && (symbol !== 'or'))) {
                              // Must quote 
                              if ((i == pCnd.length - 1) && (pCnd[i].search(/^[a-z0-9]+$/i) !== -1)) {
                                  pCndResult = pCndResult + '"' + symbol + '"';
                              }
                              else {
                                  pCndResult = pCndResult + '"' + symbol + '"' + pCnd[i];
                              }    
                          }
                          else {
                              if ((i == pCnd.length - 1) && (pCnd[i].search(/^[a-z0-9]+$/i) !== -1)) {
                                  pCndResult = pCndResult + symbol;
                              }
                              else {
                                  pCndResult = pCndResult + symbol + pCnd[i];
                              }    
                          }
                      } 
                  }
              }
              else {
                  if (in_quote === true) {
                      // Add element to result string
                      pCndResult = pCndResult + pCnd[i];
                  }    
              }
          }

  	// Replace always and never words by True or False
          pCndResult = pCndResult.replace(/\bnever\b/g,'False');
          pCndResult = pCndResult.replace(/\bNEVER\b/g,'False');
  	pCndResult = pCndResult.replace(/\balways\b/g,'True');
  	pCndResult = pCndResult.replace(/\bALWAYS\b/g,'True');
      }
      // Compile the condition to a valid expression using the parser.
      if (pBytecode === true) {
          // Compile the condition using the internal parser.
          return osweb.python._parse(pCndResult);
      }
      else {
          return pCndResult;
      } 
  }; 

  syntax.compile_cond = function(pCnd, pBytecode) {
      // Check for conditional paramters.
      pBytecode = (typeof pBytecode === 'undefined') ? true : pBytecode;

      if (pCnd == 'always') {
          return true;
      }
      else if (pCnd == 'never') {
          return false;
      } 
      else {
          if (pCnd.substring(0, 1) == '=') {
              return osweb.python._parse(pCnd.substr(1));
          }
          else {
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

  /* syntax.eval_text = function(pTxt, pVars, pRound_float, pVar) { 
      console.log('parse_text');
      console.log(pTxt);
      console.log(this.strip_slashes(pTxt));
      
      // if pTxt is an object then it is a parsed python expression.
      if (typeof(pTxt) == 'object') {
          return osweb.python._run_statement(pTxt);
      };
      // if pTxt is already a number simply return it
      if (typeof(pTxt) == "number") {
          return pTxt;
      };
      var result = '';
      var in_var = false;
      var in_var_pos = -1;
      for (var i = 0;i < pTxt.length;i++) {
          // Check status
          if (in_var === false) {
              if ((pTxt[i] === '[') && (((i > 0) && ((pTxt[i - 1] === '\\') || (pTxt[i - 1] === '/'))) === false)) {
                  in_var = true;
                  in_var_pos = i;
              } 
              else {
                  if (pTxt[i] !== '/') {
                      result = result + pTxt[i];
                  }    
              }    
          }
          else {
              if (pTxt[i] === ']') {
                  var value;
                  var variable = pTxt.substring(in_var_pos + 1, i);
                  // Check if the string is python code.
                  if (variable[0] === '=') {
                      variable = variable.slice(1);
                      if ((variable[0] === '"') && (variable[variable.length - 1] === '"'))
                          value = variable.slice(1,variable.length - 1);
                      else {
                          variable = osweb.python._parse(variable);
                          value = osweb.python._run_statement(variable);
                      }    
                  } else {
                      if (typeof pVars === 'undefined') {
                          value = osweb.runner.experiment.vars[variable];
                      } 
                      else {
                          value = pVars[variable];
                      }
                  }
                  
                  if (typeof value === 'undefined') {
                      result = result + '[' + variable + ']';
                  }
                  else {
                      result = result + value;
                  }
                  in_var = false;
              } 
              else {
              }    
          }
      }    
      //console.log('result');
      //console.log(result);

      return result;
  }; */

  syntax.eval_text = function(pTxt, pVars, pRound_float, pVar) { 
    // if pTxt is an object then it is a parsed python expression.
    if (typeof(pTxt) == 'object') {
        return osweb.python._run_statement(pTxt);
    };
    // if pTxt is already a number simply return it
    if (typeof(pTxt) == "number") {
      return pTxt;
    }
    var result = pTxt;
    var processing = result.search(/[^[\]]+(?=])/g);

    while (processing != -1) {
      // Replace the found value with the variable.
      var variable = result.slice(processing, result.indexOf(']'));
      if ((typeof pVars === 'undefined') || (typeof pVars[variable] === 'undefined')) {
        try{
          var value = osweb.runner.experiment.vars[variable];
        }catch( e ){
         // DO SOMETHING HERE! There is no real solution for this situation, if
         // the variable is not found in either pVars or osweb.runner.experiment
        }
      } else {
        var value = pVars[variable];
      }

      // Temporyary hack for string types.
      if (typeof value === 'string') {
          //result = result.replace('[' + variable + ']', "'" + value + "'");
          result = result.replace('[' + variable + ']', value);
      } 
      else {
          result = result.replace('[' + variable + ']', value);
      }
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
    return this.strip_slashes(pString)
  ;
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

  return syntax;
}