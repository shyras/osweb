// Show library name and library version number in the console.
console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER); 

// Add replaceAll function to string prototype
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(
        new RegExp(
            str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),
            (ignore?"gi":"g")),
            (typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

// Add _pySlide function to string prototype (HACK for the filbert interpreter).
String.prototype._pySlice = function(start, end, step) {
    if (end !== null) {
        return this.slice(start, end);
    } else {
        return this.slice(start);
    }    
} 