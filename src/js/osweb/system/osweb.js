/*
 * osweb 
 *  
 * An experiment research tool written in Javascript and HTML to be used in 
 * Qualtrics or other web-based tools. Based upon OpenSesame.         
 *
 * Author: drs. J. Bos
 *
 * Copyright (c) University of Groningen 
 * Faculty of Behavioural and Social Sciences
 * Technical Support Service 
 *
 */

// Use strict mode.     
"use strict";

// Load prototype
var prototype = require('prototype');
Object.extend(global, prototype);

// Check if we are running in a Node Js environment. If so, eliminate all
// items that call to document or window
var isNode = false;
if(typeof(window) == "undefined"){
    isNode = true;
    console.log("Running in Node.js mode.");
}

// If not running in node.js, bind osweb and alertify to global namespace
if(isNode == false){
    // Make osweb globally available
    // osweb = window.osweb || {};
    // window.osweb = osweb;
    var alertify = require('alertifyjs');
    window.alertify = window.alertify || alertify;    
}

var uheprng = require('random-seed');
var filbert = require('filbert');

//var createjs = require('createjs-combined');
//console.log(createjs);

// Definition of osweb version constants. 
osweb.VERSION_NAME = 'osweb';
osweb.VERSION_NUMBER = '3.0.044 (01-08-2016)';

// Show library name and library version number in the console.
console.log(osweb.VERSION_NAME + ' - ' + osweb.VERSION_NUMBER);
    
// Add replaceAll function to string prototype
String.prototype.replaceAll = function(str1, str2, ignore){
    return this.replace(
        new RegExp(
            str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),
            (ignore?"gi":"g")),
            (typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

// Definition of osweb class utility methods.
osweb.extendClass = function(sub_class, super_class) {
    function o() {
        this.constructor = sub_class;
    }
    o.prototype = super_class.prototype;
    return (sub_class.prototype = new o());
};

osweb.isClass = function(class_name) {
    // Return true if the classname is defined within the osweb namespace.
    return (this[class_name] !== undefined);
};

osweb.newItemClass = function(type, experiment, name, string) {
    // Create the element.
    var element = new this[type](experiment, name, string);

    // Set the type of the item.
    element.type = type;

    // Return the element
    return element;
};

osweb.newElementClass = function(type, sketchpad, string) {
    // Create the element.
    var element = new this[type](sketchpad, string);

    // Return the element
    return element;
};

osweb.newWidgetClass = function(type, form, variables) {
    // Create the element.
    var widget = new this[type](form, variables);

    // Return the element
    return widget;
};

osweb.promoteClass = function(sub_class, prefix) {
    var subP = sub_class.prototype,
        supP = (Object.getPrototypeOf && Object.getPrototypeOf(subP)) || subP.__proto__;
    if (supP) {
        subP[(prefix += "_") + "constructor"] = supP.constructor;
        for (var n in supP) {
            if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) {
                subP[prefix + n] = supP[n];
            }
        }
    }
    return sub_class;
};
