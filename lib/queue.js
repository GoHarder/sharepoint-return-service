// Node Imports
const events = require('events');

// Classes
class _events extends events {}

/** An instance of the node event object */
const event = new _events();

module.exports = class Queue {
   /** Creates a queue instance */
   constructor() {
      this.elements = [];
      this.events = event;
   }

   /**
    * Adds an element to the queue if it isn't there
    * @param {any} element The element to add to the queue
    */
   enqueue(element) {
      if (this.elements.includes(element) === false) {
         if (this.elements.length === 0) {
            setTimeout(() => {
               event.emit('start-queue');
            }, 1000);
         }

         this.elements.push(element);
      }
   }

   /** Removes element from the end of the queue */
   dequeue() {
      return this.elements.shift();
   }

   /** The length of the queue */
   get length() {
      return this.elements.length;
   }
};
