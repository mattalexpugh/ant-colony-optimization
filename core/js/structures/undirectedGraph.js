function UndirectedGraph(data) {
    /**
     * Generates a model of an undirected graph with weighted edges. Once
     * internal representation has been created, delegates to MinimumSpanningTree
     * to compute a MST target for future ACO algorithm runs.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param data - multidimensional array of mixed type, example: /json/graph1.js
     */

    var compiledGraph = {};
    var rawData = data;
    var allEdges = [];
    var self = this;

    var buildEdge = function(from, to, weight) {
        return new GraphNodeEdge(from, to, weight);
    };

    var buildNode = function(label, edges, weights) {
        var tmpEdges = [];
        var edge, node;

        for (var i = 0; i < edges.length; i++) {
            /* If an edge exists, this graph is undirected, so re-use that
             * via its pointer.*/
            if (_.has(compiledGraph, edges[i])) {
                node = self.getNode(edges[i]);
                edge = node.getEdgeTo(label);
            } else {
                edge = buildEdge(label, edges[i], weights[i]);
            }

            tmpEdges.push(edge);
            allEdges.push(edge); // Keep a reference to all edges.
        }

        allEdges = _.uniq(allEdges); // Remove any duplicates

        return new GraphNode(label, tmpEdges);
    };

    var buildGraph = function(data) {
        var element;

        for (var i = 0; i < data.length; i++) {
            element = data[i];
            compiledGraph[element[0]] = buildNode(element[0], element[1], element[2]);
        }
    };

    this.getAllEdges = function(sorted) {
        var sorted = sorted || false;

        if (sorted) {
            return _.sortBy(allEdges, function(e) {
                return e.getWeight();
            });
        }

        return allEdges;
    };

    this.getNode = function(label) {
        return compiledGraph[label];
    };

    this.getGraph = function() {
        return compiledGraph;
    };

    this.getEdges = function(label) {
        node = compiledGraph[label];
        return node['edges'];
    };

    this.getMST = function() {
        return mst.getMST();
    };

    this.getMSTObject = function() {
        return mst;
    };

    this.getNumNodes = function() {
        return _.size(compiledGraph);
    };

    this.getNumEdges = function() {
        return allEdges.length;
    };

    this.getLabels = function() {
        return _.keys(compiledGraph);
    };

    buildGraph(rawData);
    var mst = new MinimumSpanningTree(self);
}


function GraphNode(label, edges) {
    /**
     * Represents a single node on the undirected graph.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param label - String to be assigned to this node
     * @param edges - GraphNodeEdge[] of all edges connected to this node
     */

    this.nodeLabel = label;
    this.edges = edges;
    var self = this;

    this.getLabel = function() {
        return self.nodeLabel;
    };

    this.getEdgeTo = function(label) {
        var winner = null;

        for (var i = 0; i < self.edges.length; i++) {
            var edge = self.edges[i];

            if (edge.getTo() == label) {
                winner = edge;
            }
        }

        return winner;
    };
}


function GraphNodeEdge(from, to, weight) {
    /**
     * Represents a single edge on the undirected graph.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param from - String label of first node edge is connected to
     * @param to - String label of second node edge is connected to
     * @param weight - int weight of this edge
     */

    this.nodeFrom = from;
    this.nodeTo = to;
    this.nodeWeight = weight;
    this.nodeLabel = null;
    var self = this;

    this.getFrom = function() {
        return self.nodeFrom;
    };

    this.getTo = function() {
        return self.nodeTo;
    };

    this.contains = function(node) {
        /**
         * Returns boolean denoting whether either side of this edge is
         * connected to the supplied node label.
         *
         * @param node - String label of node wanted
         * @return bool - true if either node on this edge is input node
         */
        return ((self.getTo() == node) || (self.getFrom() == node));
    };

    this.getWeight = function() {
        return self.nodeWeight;
    };

    this.getLabel = function() {
        return self.nodeLabel;
    };

    this.setLabel = function(label) {
        self.nodeLabel = label;
    };
}
