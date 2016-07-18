
(function() {
    // Definition of the class constants.
    function constants() {
    	throw 'The class constants cannot be instantiated!';
    }

    // Definition of error constants. 
    constants.ERROR_001 = 'osweb has stopped running due a fatal error.';
    constants.ERROR_002 = 'No content parameter specified.';
    constants.ERROR_003 = 'No context parameter specified.';
    constants.ERROR_004 = 'Invalid scriptID or scriptURL for retrieving script from external location.';
    constants.ERROR_005 = 'Failure to retrieve script from external location (Ajax call error).';
    constants.ERROR_006 = 'Failure to retrieve script from external location (database response error)';
    constants.ERROR_007 = 'Failure to retrieve script from external location (database retrieve error).';
    constants.ERROR_008 = 'Invalid script definition, parsing error.';
    constants.ERROR_009 = 'Unknown class definition within osweb script - ';

    // Definition of message constants. 
    constants.MESSAGE_001 = 'Os';
    constants.MESSAGE_002 = 'web - version ';
    constants.MESSAGE_003 = 'Start up osweb experiment session.';
    constants.MESSAGE_004 = 'Retrieving stimuli files.';
    constants.MESSAGE_005 = 'Retrieving input parameters.';
    constants.MESSAGE_006 = 'Press with the mouse on this screen to continue.';
    constants.MESSAGE_007 = 'Warning: this method is not implemented in the current version of OsWeb - ';
    constants.MESSAGE_008 = 'Retrieving session information.';

    // Definition of general constants. 
    constants.STATUS_NONE = 0;                   // Running status of an item.   
    constants.STATUS_BUILD = 1;
    constants.STATUS_INITIALIZE = 2;
    constants.STATUS_EXECUTE = 3;
    constants.STATUS_FINALIZE = 4;
    constants.PARSER_NONE = 0;                   // Running status of the parser.
    constants.PARSER_EXECUTE = 1;
    constants.STATUS_PENDING = 2;
    constants.STATUS_DONE = 3;
    constants.PRESSES_ONLY = 1;                  // Type of used collection mode.           
    constants.RELEASES_ONLY = 2;
    constants.PRESSES_AND_RELEASES = 3;
    constants.RESPONSE_NONE = 0;                 // Type of response used.
    constants.RESPONSE_DURATION = 1;
    constants.RESPONSE_KEYBOARD = 2;
    constants.RESPONSE_MOUSE = 3;
    constants.RESPONSE_SOUND = 4;
    constants.RESPONSE_AUTOKEYBOARD = 5;
    constants.RESPONSE_AUTOMOUSE = 6;
    constants.UPDATE_NONE = 0;                  // Item update status flag.
    constants.UPDATE_ONSET = 1;
    constants.UPDATE_OFFSET = 2;
    constants.SEQUENTIAL = 0;                   // Loop randomization type.
    constants.RANDOM = 1;
    constants.RANDOMREPLACEMENT = 2;

    // Bind the constants class to the osweb namespace.
    osweb.constants = constants;
}()); 
