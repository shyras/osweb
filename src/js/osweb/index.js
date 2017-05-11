/*
 * OsWeb 
 *  
 * An experiment research tool written in Javascript (ES2016) and HTML to be  
 * used in Qualtrics or other web-based tools. Based upon OpenSesame.         
 *
 * Author: drs. J. Bos, D. Schreij & S. Mathot
 *
 * Copyright (c) University of Groningen 
 * Faculty of Behavioural and Social Sciences
 * Technical Support Service 
 *
 */

import Runner from './system/runner.js';

export const VERSION_NAME = 'OSWeb (ES2016)';
export const VERSION_NUMBER = '3.0.055 (11-05-2017)';

// Add replaceAll function to string prototype
String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(
        new RegExp(
            str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
            (ignore ? "gi" : "g")),
        (typeof(str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}

// Add _pySlide function to string prototype (HACK for the filbert interpreter).
String.prototype._pySlice = function(start, end, step) {
    if (end !== null) {
        return this.slice(start, end);
    } else {
        return this.slice(start);
    }
}

// Create the osweb library container.
const osweb = {
    printVersionInfo: function() {
        // Show library name and library version number in the console.
        console.log(VERSION_NAME + ' - ' + VERSION_NUMBER);
    },
    getRunner: function(target) {
        return new Runner(target);
    }
}

export default osweb;