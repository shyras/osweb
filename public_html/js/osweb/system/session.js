
/*
 * Definition of the class session.
 */

(function() 
{
    function session() 
    {
    	throw "The class session cannot be instantiated!";
    }

    // Definition of public properties.
    session.data = {};

    /*
     * Definition of session related methods.   
     */

    session._initialize = function()
    {
    	// Update the loader text.
    	osweb.runner._updateIntroScreen(osweb.constants.MESSAGE_008);
	
    	// Get the session information.
	this._getSessionInformation();
    };

    /*
     * Definition of session related methods.   
     */

    session._getSessionInformation = function()
    {
    	// Get the session information from the client system
    	this.date = new Date();
	this.data = 
        {
            "browser": 
            {
                "codename"        : navigator.appCodeName,
                "name"            : navigator.appName,
                "version"         : navigator.appVersion
            },
            "date": 
            {
                "startdate"       : ('0' + this.date.getDate()).slice(-2) + '-' + ('0' + this.date.getMonth()).slice(-2) + '-' + ('0' + this.date.getFullYear()).slice(-2),
                "starttime"       : ('0' + this.date.getHours()).slice(-2) + ':' + ('0' + this.date.getMinutes()).slice(-2) + ':' + ('0' + this.date.getSeconds()).slice(-2),
                "startdateUTC"    : ('0' + this.date.getUTCDate()).slice(-2) + '-' + ('0' + this.date.getUTCMonth()).slice(-2) + '-' + ('0' + this.date.getUTCFullYear()).slice(-2)
            },
            "experiment": 
            {
		"debug"		  : 0,
                "parameters"	  : 0,
		"pilot"           : 0,
                "taskname"        : 0,
                "taskversion"     : 0
            },
            "screen":
            {
                "availableHeight" : screen.availHeight,
                "availableWidth"  : screen.availWidth,
                "colorDepth"      : screen.colorDepth,
                "height"          : screen.height,
                "outerheight"     : window.outerheight,
                "outerwidth"      : window.outerwidth,
                "pixelDepth"      : screen.pixelDepth,
                "screenX"         : window.screenX,
                "screenY"         : window.screenY,
                "width"           : screen.width
            },
            "system": 
            {
                "os"              : navigator.platform
            }
        };
    };

    // Bind the session class to the osweb namespace.
    osweb.session = session;
}()); 
