(function() {
    // Definition of the class session - store user session information. 
    function session() {
        throw 'The class session cannot be instantiated!';
    }

    // Definition of private methods.   

    session._initialize = function() {
        // Update the loader text.
        osweb.screen._updateIntroScreen(osweb.constants.MESSAGE_008);

        // Get the session information.
        this._getSessionInformation();
    };

    session._getSessionInformation = function() {
        // Get the session information from the client system.
        this._date = new Date();
        this._session = {
            'browser': {
                'codename': navigator.appCodeName,
                'name': navigator.appName,
                'version': navigator.appVersion
            },
            'date': {
                'startdate': ('0' + this._date.getDate()).slice(-2) + '-' + ('0' + this._date.getMonth()).slice(-2) + '-' + ('0' + this._date.getFullYear()).slice(-2),
                'starttime': ('0' + this._date.getHours()).slice(-2) + ':' + ('0' + this._date.getMinutes()).slice(-2) + ':' + ('0' + this._date.getSeconds()).slice(-2),
                'startdateUTC': ('0' + this._date.getUTCDate()).slice(-2) + '-' + ('0' + this._date.getUTCMonth()).slice(-2) + '-' + ('0' + this._date.getUTCFullYear()).slice(-2)
            },
            'experiment': {
                'debug': 0,
                'parameters': 0,
                'pilot': 0,
                'taskname': 0,
                'taskversion': 0
            },
            'screen': {
                'availableHeight': screen.availHeight,
                'availableWidth': screen.availWidth,
                'colorDepth': screen.colorDepth,
                'height': screen.height,
                'outerheight': window.outerheight,
                'outerwidth': window.outerwidth,
                'pixelDepth': screen.pixelDepth,
                'screenX': window.screenX,
                'screenY': window.screenY,
                'width': screen.width
            },
            'system': {
                'os': navigator.platform
            }
        };
    };

    // Bind the session class to the osweb namespace.
    osweb.session = session;
}());