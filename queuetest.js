var capacity = 100;
let  queue = require('fixed-size-queue').create(capacity);

queue.enqueue(1)
console.log(queue.peek()) // prints 1
queue.enqueue(2) // prints 2
console.log(queue.peek())
queue.dequeue()
console.log(queue.peek())
