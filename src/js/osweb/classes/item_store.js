/*
 * Definition of the class item_store.
 */

(function() {
    function item_store() {
        throw "The class item_store cannot be instantiated!";
    }

    // Set the class private properties. 
    item_store._experiment = null;
    item_store._items = {};

    /*
     * Definition of public methods - running item.         
     */

    item_store.execute = function(pName, pParent) {
        // Executes the run and prepare phases of an item, and updates the item stack.
        this.prepare(pName);
        this.run(pName, pParent);
    };

    item_store.items = function() {
        // Create a list o keys.
        var items = [];
        for (var key in this._items) {
            items.push([key, this._items[key]]);
        }

        // Returns a list of item names.
        return items;
    };

    item_store.keys = function() {
        // Create a list o keys.
        var keys = [];
        for (var key in this._items) {
            keys.push(key);
        }

        // Returns a list of item names.
        return keys;
    };

    item_store.new = function(pType, pName, pScript) {
        // Check if the element is part of the osweb name space
        if (osweb.isClass(pType) == true) {
            // Add the new item as property of items.
            this._items[pName] = osweb.newItemClass(pType, this._experiment, pName, pScript);
        } else {
            // Unkwone class definition, show error message.
            osweb.debug.addError(osweb.constants.ERROR_009 + pType);
        }
    };

    item_store.prepare = function(pName, pParent) {
        // Executes the prepare phase of an item, and updates the item stack.
        osweb.item_stack.push(pName, 'prepare');

        this._items[pName]._parent = pParent;
        this._items[pName].prepare();
    };

    item_store.run = function(pName, pParent) {
        // Set the current and its parent item.
        osweb.events._current_item = this._items[pName];
        osweb.events._current_item._parent = pParent;

        // Executes the run phase of an item, and updates the item stack.
        osweb.item_stack.push(pName, 'run');
        this._items[pName].run();
    };

    item_store.valid_name = function(pItem_type, pSuggestion) {
        // Check the optional parameters.
        pSuggestion = (typeof pSuggestion === 'undefined') ? null : pSuggestion;

        if (pSuggestion == null) {
            var name = 'new_' + pItem_type;
        } else {
            var name = this._experiment.syntax.sanitize(pSuggestion, true, false);
        }

        // Create a unique name.
        var i = 1;
        var _name = name;
        while (this._items.hasOwnProperty(_name) == true) {
            _name = name + '_' + String(i);
            i++;
        }

        // Return function result
        return _name;
    };

    item_store.values = function() {
        // Create a list o keys.
        var values = [];
        for (var key in this._items) {
            values.push(this._items[key]);
        }

        // Returns a list of item names.
        return values;
    };

    // Bind the item_store class to the osweb namespace.
    osweb.item_store = item_store;
}());