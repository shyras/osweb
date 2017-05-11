/** Class representing OpenSesame themes. */
export default class Themes {
    /** Create a themes object which cpntains a list of html themes. */
    constructor() {
        // Definition of public properties.   
        this.theme = [];
        this.theme['gray'] = {
            backgroundColor : '#888a85', 
            box_size: 16,
            lineColorLeftTop: '#babdb6', 
            lineColorRightBottom: '#555753'
        };
    }    
}    
 