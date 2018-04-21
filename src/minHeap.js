// minimum heap ltFunc (a, b) should return > 0 if a < b, 0 if a = b, < 0 if a > b
/** @constructor */
var MinHeap = function (cmpFunc) {
    this.cmp = cmpFunc;
    this.heap = [];
};
MinHeap.prototype.add = function (elem) {
    this.heap.push (elem);
};
// inneficient, but simple implementation
MinHeap.prototype.getMin = function () {
    var index;
    if (this.heap.length === 0) {
        return null;
    }
    var min = this.heap[0];
    for (var i = 0; i < this.heap.length; i++) {
        if (this.cmp(this.heap[i], min) > 0 ) {
            min = this.heap[i];
        }
    }
    return min;
}
MinHeap.prototype.deleteMin = function () {
    var min = this.getMin();
    var index = this.heap.indexOf(min);
    this.heap[index] = this.heap[this.heap.length - 1];
    this.heap.pop();
    return min;
};
MinHeap.prototype.getLength = function () {
    return this.heap.length;
};
MinHeap.prototype.empty = function () {
    return this.heap.length > 0 ? false : true;
};
