export const constants = {
    // Type of used collection mode.           
    PRESSES_ONLY: 1,
    RELEASES_ONLY: 2,
    PRESSES_AND_RELEASES: 3,
        
    // Type of response used.
    RESPONSE_NONE: 0, 
    RESPONSE_DURATION: 1,
    RESPONSE_KEYBOARD: 2,
    RESPONSE_MOUSE: 3,
    RESPONSE_SOUND: 4,
    RESPONSE_AUTOKEYBOARD: 5,
    RESPONSE_AUTOMOUSE: 6,
 
    // Running status of an item.   
    STATUS_NONE: 0, 
    STATUS_BUILD: 1,
    STATUS_INITIALIZE: 2,
    STATUS_EXECUTE: 3,
    STATUS_FINALIZE: 4,
    
    // Definition of the event loop status contstants.
    TIMER_NONE: 0,
    TIMER_WAIT: 1,
    TIMER_EXIT: 2,
    TIMER_PAUSE: 3,
    TIMER_RESUME: 4,
    TIMER_DONE: 5,
    TIMER_BREAK: 6,
    TIMER_ERROR: 7
}
 