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
osweb.VERSION_NUMBER = '0.034 (21-06-2016)';

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

/*
 * Definition of the class constants.
 */

(function() 
{
    function constants() 
    {
    	throw "The class constants cannot be instantiated!";
    }

    /*
     * Definition of error constants. 
     */

    constants.ERROR_001 = 'osweb has stopped running due a fatal error.';
    constants.ERROR_002 = 'No content parameter specified.';
    constants.ERROR_003 = 'No context parameter specified.';
    constants.ERROR_004 = 'Invalid scriptID or scriptURL for retrieving script from external location.';
    constants.ERROR_005 = 'Failure to retrieve script from external location (Ajax call error).';
    constants.ERROR_006 = 'Failure to retrieve script from external location (database response error)';
    constants.ERROR_007 = 'Failure to retrieve script from external location (database retrieve error).';
    constants.ERROR_008 = 'Invalid script definition, parsing error.';
    constants.ERROR_009 = 'Unknown class definition within osweb script - ';

    /*
     * Definition of message constants. 
     */

    constants.MESSAGE_001 = 'OS';
    constants.MESSAGE_002 = 'web - version ';
    constants.MESSAGE_003 = 'Start up osweb experiment session.';
    constants.MESSAGE_004 = 'Retrieving stimuli files.';
    constants.MESSAGE_005 = 'Retrieving input parameters.';
    constants.MESSAGE_006 = 'Press with the mouse on this screen to continue.';

    /*
     * Definition of general constants. 
     */
 	               
    // Set the class default constants.
    constants.STATUS_NONE          = 0;
    constants.STATUS_BUILD         = 1;
    constants.STATUS_INITIALIZE    = 2;
    constants.STATUS_EXECUTE       = 3;
    constants.STATUS_FINALIZE      = 4;

    // Set the class default constants.
    constants.PARSER_NONE          = 0;
    constants.PARSER_EXECUTE       = 1;
    constants.STATUS_PENDING       = 2;
    constants.STATUS_DONE          = 3;

    // Constant definitions (collectionMode)
    constants.PRESSES_ONLY         = 1;
    constants.RELEASES_ONLY        = 2;
    constants.PRESSES_AND_RELEASES = 3;

    // Constant definitions (collectionMode)
    constants.RESPONSE_NONE         = 0;
    constants.RESPONSE_DURATION     = 1;
    constants.RESPONSE_KEYBOARD     = 2;
    constants.RESPONSE_MOUSE        = 3;
    constants.RESPONSE_SOUND        = 4;
    constants.RESPONSE_AUTOKEYBOARD = 5;
    constants.RESPONSE_AUTOMOUSE    = 6;
    
    // Constant definitions (system update)
    constants.UPDATE_NONE          = 0;
    constants.UPDATE_ONSET         = 1;
    constants.UPDATE_OFFSET        = 2;

    // Define the class public contants properties.
    constants.SEQUENTIAL           = 0;
    constants.RANDOM               = 1;
    constants.RANDOMREPLACEMENT    = 2;

    // Bind the constants class to the osweb namespace.
    osweb.constants = constants;
}()); 
