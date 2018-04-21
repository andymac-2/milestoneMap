'use strict'

/** @interface */
var WeightedNode = function () {}

// read only
/** @type {[weightedNode]} */
WeightedNode.prototype.outgoing;
/** @type {[weightedNode]} */
WeightedNode.prototype.incoming;
/** @type {number} */
WeightedNode.prototype.weight;
/** @type {number} */
WeightedNode.prototype.priority;

// modifiable properties
/** 
    a nodes value is at least minValue and at least as big as all of
    it's dependents values plus their weight. the value is the "start" of the node
@type {number} */
WeightedNode.prototype.value;
/** @type {boolean} */
WeightedNode.prototype.visited;




var nodeWeightedGraph = {};

/** a topological sort
@type {function([WeightedNode]):[WeightedNode]}
*/
nodeWeightedGraph.topoSort = function (nodes) {
    var active = [];
    var result = [];

    // find all nodes which have no dependencies, also set all nodes
    // visited to "false"
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].visited = false;
    }

    for (var i = 0; i < nodes.length; i++) {
        if (this.fulfilledDependencies(nodes[i])) {
            active.push(nodes[i]);
        }
    }

    // for each element in the active list, check all of it's
    // dependants. If any of the dependants dependencies have all been
    // fulfilled and it has not been visited yet, add it to the active
    // list.
    
    for (i = 0; i < active.length; i++) {
        if (active[i].visited !== true) {
            result.push(active[i]);
        }
        active[i].visited = true;

        var outgoing = active[i].outgoing;
        
        for (var j = 0; j < outgoing.length; j++) {
            var dependent = outgoing[j].dependent;
            if (this.fulfilledDependencies (dependent) &&
                 dependent.visited === false)
            {           
                active.push(dependent);
            }
        }
    }

    // cyclic graph.
    if (result.length !== nodes.length) {
        return [];
    }

    return result;
};
nodeWeightedGraph.fulfilledDependencies =  function (node) {
    for (var i = 0; i < node.incoming.length; i++) {
        var dependency = node.incoming[i].dependency;
        
        if (dependency.priority <= node.priority &&
            dependency.visited === false)
        {
            return false;
        }
    }
    return true;
};

/** sort nodes by their minimal possible value.
@type {function([WeightedNode]):[WeightedNode]}
*/
nodeWeightedGraph.greedySort = function (nodes) {
    var topoSorted = this.topoSort (nodes);

    if (topoSorted.length === 0) {
        return [];
    }

    for (var i = 0; i < topoSorted.length; i++) {
        var node = topoSorted [i];
        var incoming = node.incoming;
        node.value = 0;
        
        for (var j = 0; j < incoming.length; j++) {
            var dependency = incoming[j].dependency;
            if (dependency.priority <= node.priority) {                
                var currentVal = dependency.value + dependency.weight;                
                node.value = node.value > currentVal ? node.value : currentVal;
            }
        }
    }

    var priorities = [];

    // separate by prioritites
    topoSorted.forEach(product => {
        var prio = product.priority;
        if (!priorities[prio]) {
            priorities[prio] = [product];
        }
        else {
            priorities[prio].push(product);
        }
    });

    // sort within priorities by value
    priorities.forEach(productList => {
        productList.sort(Product.compareByValue);
    });

    return priorities;
};


// Tests
var nWGTest = function (nodes) {
    nodeWeightedGraph.greedySort(nodes);

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var incoming = nodes[i].incoming;
        var value = nodes[i].value;
        var maxvalue = 0;
        
        for (var j = 0; j < incoming.length; j++) {
            var testvalue = incoming[j].dependency.value +
                incoming[j].dependency.weight;
            if (node.priority <= incoming[j].dependency.priority) {
                maxvalue = testvalue > maxvalue ? testvalue : maxvalue;
            }
        }

        assert (() => maxvalue === value);
    }
};


var nWGTests = function () {
    runTests ({
        
        "Single object": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priority: 0}
            ],
            dependencies: [],
            start: 0,
            prioritiesList: [0]
        }).products),
        
        "Single dependency": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priority: 0},
                {name: "two", weight: 2, priority: 0}
            ],
            dependencies: [
                {dependency: 0, dependent: 1}
            ],
            start: 0,
            prioritiesList: [0]
        }).products),
        
        "Circular dependency": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priority: 0},
                {name: "two", weight: 2, priority: 0}
            ],
            dependencies: [
                //   {dependency: 0, dependent: 1},
                {dependency: 1, dependent: 0}
            ],
            start: 0,
            prioritiesList: [0]
        }).products),

        "Complicated dependencies": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 4, priority: 0},
                {name: "two", weight: 30, priority: 0},
                {name: "three", weight: 3, priority: 0},
                {name: "four", weight: 30, priority: 0},
                {name: "five", weight: 8, priority: 0},
                {name: "six", weight: 3, priority: 0},
                {name: "seven", weight: 3, priority: 0}
            ],
            dependencies: [
                {dependency: 0, dependent: 1},
                {dependency: 2, dependent: 1},
                {dependency: 0, dependent: 3},
                {dependency: 2, dependent: 3},
                {dependency: 1, dependent: 4},
                {dependency: 3, dependent: 4},
                {dependency: 2, dependent: 5},
                {dependency: 1, dependent: 5},
                {dependency: 2, dependent: 6},
                {dependency: 0, dependent: 6},
                {dependency: 6, dependent: 5},
                {dependency: 6, dependent: 4}
            ],
            start: 0,
            prioritiesList: [0]
        }).products)
    });
}
