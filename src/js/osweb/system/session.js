/** Class representing a client session information collector. */
export default class Session {
    /**
     * Create an session object which stores information about the client system.
     * @param {Object} runner - The runner class to which the session belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._date = null; // Date information container.
        this._runner = runner; // Parent runner attached to the session object.    
        this._session = null; // Session information container.
    }    

    /** Initialize the session. */
    _initialize() {
        // Update the loader text.
        this._runner._screen._updateIntroScreen('Retrieving session information.');

        // Get the session information.
        this._getSessionInformation();
    }

    /** Retrieve session information from the client. */
    _getSessionInformation() {
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
    }
}    
