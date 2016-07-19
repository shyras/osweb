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

// Set osweb namespace.
this.osweb = this.osweb||{};

// Definition of osweb version constants. 
osweb.VERSION_NAME   = 'osweb';
osweb.VERSION_NUMBER = '0.040 (19-07-2016)';

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
    var subP = sub_class.prototype, supP = (Object.getPrototypeOf&&Object.getPrototypeOf(subP))||subP.__proto__;
    if (supP) {
    	subP[(prefix+="_") + "constructor"] = supP.constructor; 
    	for (var n in supP) {
            if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) {
                subP[prefix + n] = supP[n]; 
            }
	}
    }
    return sub_class;
}; 
