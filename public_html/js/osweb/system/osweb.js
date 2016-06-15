/*
 * OSweb 
 *  
 * An experiment research tool written in Javascript and HTML to be used in 
 * Qualtrics or other web-based tools. 
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

/*
 * Definition of osweb version constants. 
 */

osweb.VERSION_NAME   = 'osweb';
osweb.VERSION_NUMBER = '0.031 (14-06-2016)';

/*
 * Definition of osweb class utility methods.
 */

osweb.extendClass = function(pSubClass, pSuperClass) 
{
    function o() { this.constructor = pSubClass; }
    o.prototype = pSuperClass.prototype;
    return (pSubClass.prototype = new o());
}; 

osweb.isClass = function(pClassName)
{
    // Return true if the classname is defined within the osweb namespace.
    return (this[pClassName] !== undefined);
};

osweb.newItemClass = function(pType, pExperiment, pName, pString)
{
    // Create the element.
    var element = new this[pType](pExperiment, pName, pString);
   	
    // Return the element
    return element;
};

osweb.newElementClass = function(pType, pSketchpad, pString)
{
    // Create the element.
    var element = new this[pType](pSketchpad, pString);
   	
    // Return the element
    return element;
};

osweb.newWidgetClass = function(pType, pForm, pVariables)
{
    // Create the element.
    var widget = new this[pType](pForm, pVariables);
   	
    // Return the element
    return widget;
}; 

osweb.promoteClass = function(pSubClass, pPrefix) 
{
    var subP = pSubClass.prototype, supP = (Object.getPrototypeOf&&Object.getPrototypeOf(subP))||subP.__proto__;
    if (supP) 
    {
    	subP[(pPrefix+="_") + "constructor"] = supP.constructor; 
    	for (var n in supP) 
    	{
            if (subP.hasOwnProperty(n) && (typeof supP[n] === "function")) { subP[pPrefix + n] = supP[n]; }
	}
    }
    return pSubClass;
}; 
