/*
 * Definition of the class item_stack.
 */

(function() {
    function item_stack() {
        throw "The class item_stack cannot be instantiated!";
    };

    // Definition of private class properties.
    item_stack._items = [];

    /*
     * Definition of public class methods.   
     */

    item_stack.clear = function() {
        // Clears the stack.
        this._items = [];
    };

    item_stack.push = function(pItem, pPhase) {
        // Create the stack item.
        var StackItem = {
            'item': pItem,
            'phase': pPhase
        };

        // Push the item onto the stack.
        this._items.push(StackItem);
    };

    item_stack.pop = function() {
        // Pops the last item from the stack.
        return this._items.pop();
    };

    // Bind the item_stack class to the osweb namespace.
    osweb.item_stack = item_stack;
}());