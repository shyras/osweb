/** Class representing an item stack. */
export default class ItemStack {
    /**
     * Create an stack array for running items.
     * @param {Object} runner - The runner to which the item stack belongs.
     */
    constructor(runner) {
        // Create and set private properties. 
        this._items = []; // Container for all items.
        this._runner = runner; // Parent runner attached to the item stack class.    
    }

    /** Clear the entire item stack. */
    clear() {
        // Clears the stack.
        this._items = [];
    }

    /**
     * Push a new item onto the item stack.
     * @param {Object} item - The item to add to the item stack.
     * @param {String} phase - The phase in which the stack exists.
     */
    push(item, phase) {
        // Create the stack item.
        var stackItem = {
            'item': item,
            'phase': phase
        };

        // Push the item onto the stack.
        this._items.push(stackItem);
    }

    /**
     * Pops the last item from the stack.
     * @return {Object} - The last added item from the stack.
     */
    pop() {
        // Pops the last item from the stack.
        return this._items.pop();
    }
}
 