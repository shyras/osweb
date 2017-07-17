// This itemClasses variable is a temporary solution. We should think of a simpler
// method of converting string names (e.g. keyboard_response) to the associated
// class names (e.g. KeyboardResponse), without relying on eval.
import { itemClasses } from '../system/constants.js';

/** Class representing an item store. */
export default class ItemStore {
    /**
     * Create an item store for all OpenSesame items.
     * @param {Object} runner - The runner to which the item store belongs.
     */
    constructor(runner) {
        // Set the class private properties. 
        this._items = {}; // All the unique items in the item store.
        this._runner = runner; // Parent runner attached to the item store.    
    }    

    /** Clear all the items in the store. */
    _clean_up() {
        // Clear the items.
        this._items = {};
    }

    /**
     * Checks of the classname is defined within the osweb namespace.
     * @param {String} className - name of the class to check.
     * @return {Boolean} - True if the class is valid within the opsweb context.
     */
    _isClass(className) {
        // Return true if the classname is found in the item classes.
        return (className in itemClasses);
    }

    /**
     * Add a new OpenSesame element to a sketchpad item.
     * @param {String} type -type of the element to be created.
     * @param {Object} sketchpad - sketchpad item to which the item belongs.
     * @param {String} script - string definition of the ites.
     * @return {Object} - The item which wass created.
     */
    _newElementClass(type, sketchpad, string) {
        // Create the element.
        var element = new itemClasses[type](sketchpad, string);

        // Return the element
        return element;
    }

    /**
     * Add a new OpenSesame item to the experiment.
     * @param {String} type -type of the item to be created.
     * @param {Object} experiment - experiment item to which the item belongs.
     * @param {String} name - name of the item to be created.
     * @param {String} script - string definition of the ites.
     * @return {Object} - The item which was created.
     */
    _newItemClass(type, experiment, name, script) {
        // Create the element.
        var element = new itemClasses[type](experiment, name, script);

        // Set the type of the item.
        element.type = type;

        // Return the element
        return element;
    }

    /**
     * Add a new OpenSesame widget to the experiment.
     * @param {String} type -type of the widget to be created.
     * @param {Object} form - form to which the widget belongs.
     * @param {String} variables - variabled belonging to the widget.
     * @return {Object} - The widget which was created.
     */
    _newWidgetClass(type, form, variables) {
        // Create the widget.
        var widget = new itemClasses[type + '_widget'](form, variables);

        // Return the element
        return widget;
    }

    /**
     * Executes the prepare and the run phase of an item.
     * @param {String} name - name of the item to prepare and run
     * @param {String} parent - parent of the item.
     */
    execute(name, parent) {
        // Prepare the item.
        this.prepare(name, parent);
        
        // Run the item.
        this.run(name, parent);
    }

    /**
     * Create an array with all the items in the store.
     * @return {Array} - An array containing all the items.
     */
    items() {
        // Create a list o keys.
        var items = [];
        for (var key in this._items) {
            items.push([key, this._items[key]]);
        }

        // Returns a list of item names.
        return items;
    }

    /**
     * Create an array with all the names of the items in the store.
     * @return {Array} - An array containing all the names.
     */
    keys() {
        // Create a list o keys.
        var keys = [];
        for (var key in this._items) {
            keys.push(key);
        }

        // Returns a list of item names.
        return keys;
    }

    /**
     * Create a new OpenSesame item and add it to the item store.
     * @param {String} type - type of item to add.
     * @param {String} name - unique name of the item to add.
     * @param {String} script - script containing definitions of the item.
     */
    newItem(type, name, script) {
        // Check if the element is part of the osweb name space
        if (this._isClass(type) === true) {
            // Add the new item as property of items.
            this._items[name] = this._newItemClass(type, this._runner._experiment, name, script);
        
            return this._items[name];
        } else {
            // Unkwone class definition, show error message.
            this._runner._debugger.addError('Unknown class definition within osweb script: ' + type);
        }
    }

    /**
     * Executes the prepare phase of an item, and updates the item stack.
     * @param {String} name - name of the item to prepare.
     * @param {String} parent - parent of the item.
     */
    prepare(name, parent) {
        // Add item to the stack.
        this._runner._itemStack.push(name, 'prepare');

        // Prepare the item.
        this._items[name]._parent = parent;
        this._items[name].prepare();
    }

    /**
     * Executes the run phase of an item, and updates the item stack.
     * @param {String} name - name of the item to run.
     * @param {String} pParent - parent of the item.
     */
    run(name, parent) {
        // Set the current and its parent item.
        this._runner._events._currentItem = this._items[name];
        this._runner._events._currentItem._parent = parent;

        // Executes the run phase of an item, and updates the item stack.
        this._runner._itemStack.push(name, 'run');
        this._items[name].run();
    }

    /**
     * Create a valid name for an item within the OpenSesame context.
     * @param {String} itemType - type of the item for which a name must be build.
     * @param {String} suggestion - An suggestion how to build up the name.
     * @return {String} - A valid string name for the given item.
     */
    valid_name(itemType, suggestion) {
        // Check the optional parameters.
        suggestion = (typeof suggestion === 'undefined') ? null : suggestion;

        if (suggestion === null) {
            var name = 'new_' + itemType;
        } else {
            var name = this._runner._experiment.syntax.sanitize(suggestion, true, false);
        }

        // Create a unique name.
        var i = 1;
        var uniqueName = name;
        while (this._items.hasOwnProperty(uniqueName) === true) {
            uniqueName = name + '_' + String(i);
            i++;
        }

        // Return function result
        return uniqueName;
    }

    /**
     * Create an array with all the values (items) in the store.
     * @return {Array} - An array containing all the items.
     */
    values() {
        // Create a list o keys.
        var values = [];
        for (var key in this._items) {
            values.push(this._items[key]);
        }

        // Returns a list of item names.
        return values;
    }
}
 