 /*
  * Definition of the class syntax.
  */

 (function() {
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

     syntax.eval_text = function(pTxt, pVars, pRound_float, pVar) {
         // Evaluates variables and inline Python in a text string.
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

     syntax.parse_cmd = function(pString) {
         // split the astring.
         var tokens = this.split(pString);
         tokens.shift();
         tokens.shift();
         return tokens;
     };

     syntax.sanitize = function(pString, pStrict, pAllowVars) {
         // Removes invalid characters (notably quotes) from the string.
         return pString;
     };

     syntax.split = function(pLine) {
         // Return an array with tokens ignoring whitespaces within. 
         var result = pLine.match(/(?:[^\s"]+|"[^"]*")+/g);

         return (result != null) ? result : [];
     };

     // Bind the syntax class to the osweb namespace.
     osweb.syntax = syntax;
 }());