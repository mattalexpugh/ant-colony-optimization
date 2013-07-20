function ConstructedGraph(undirected) {
    /**
     * Constructs an ACO construction graph based on Kruskal's algorithm.
     * The input param undirected has to be of the UndirectedGraph type, with
     * computed MST contained within (see UndirectedGraph).
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param undirected - UndirectedGraph propagated object.
     */

    this.undirected = undirected;
    this.graph = {};
    this.allEdges = [];
    this.target = undirected.getMST();
    var self = this;

    var constructGraph = function() {
        /**
         * Constructs the construction graph using approximately O(n^2)
         * complexity, building nodes for edges on the input graph.
         */

        var undirected = self.getUndirectedGraph();
        var edges = undirected.getAllEdges();
        var tmpNodes = [];
        var tmpEdges = [];
        var node, label;
        var from, to, edge;

        for (var i = 0; i < undirected.getNumEdges(); i++) {
            label = "" + (i + 1) + "";
            edges[i].setLabel(label);
            tmpNodes.push(new ConstructedGraphNode(label, edges[i]));
        }

        // The first node, 0, of the constructed graph.
        self.graph['0'] = new ConstructedGraphNode('0', null);

        for (i = 0; i < tmpNodes.length; i++) {
            edge = new ConstructedGraphNodeEdge('0', tmpNodes[i].getLabel());
            tmpEdges.push(edge);
            self.allEdges.push(edge);
        }

        self.graph['0'].setEdges(tmpEdges);

        // Now the rest... apologies for the n^2 runtime...
        for (i = 0; i < tmpNodes.length; i++) {
            tmpEdges = [];
            from = "" + (i + 1) + "";

            for (j = 0; j < tmpNodes.length; j++) {

                if (j == i) { // Doesn't need a reference to itself
                    continue;
                }

                to = "" + (j + 1) + "";
                edge = new ConstructedGraphNodeEdge(from, to);
                // @todo: double check this is right
                edge.setEta(1 / tmpNodes[j].getOriginalEdge().getWeight());
                tmpEdges.push(edge);
                self.allEdges.push(edge);
            }

            tmpNodes[i].setEdges(tmpEdges);
            self.graph[from] = tmpNodes[i];
        }
    };

    this.getAllEdges = function() {
        return self.allEdges;
    };

    this.getLabels = function() {
        return _.keys(this.graph);
    };

    this.getGraph = function() {
        return self.graph;
    };

    this.getNode = function(node) {
        return self.getGraph()[node];
    };

    this.getAllNodes = function(skipZero) {
        /**
         * Returns all ConstructionGraphNode objects, with the option to
         * exclude node 0 (S0).
         *
         * @param skipZero - bool [optional], if present and true, skips S0
         * @return ConstructionGraphNode[] list of nodes in this graph
         */

        skipZero = skipZero || false;
        var nodes = _.values(self.getGraph());

        if (skipZero) {
            var node = self.getNode('0');
            nodes = _.without(nodes, node);
        }

        return nodes;
    };

    this.getNumEdges = function() {
        return self.getAllEdges().length;
    };

    this.getNumNodes = function(skipZero) {
        /**
         * Returns the number of nodes in this graph.
         *
         * @param skipZero - bool [optional], exclude S0
         * @return int number of nodes
         */
        skipZero = skipZero || false;
        return _.values(self.getAllNodes(skipZero)).length;
    };

    this.getUndirectedGraph = function() {
        return self.undirected;
    };

    var initialisePheromoneValues = function() {
        /**
         * Initialises pheromone values of all edges through:
         * τ(u, v) = 1 / |A|
         */
        var initialPheromone = 1 / self.getNumEdges();
        var element;
        var edges = self.getAllEdges();

        for (var i = 0; i < edges.length; i++) {
            element = edges[i];
            element.setPheromone(initialPheromone);
        }
    };

    constructGraph();
    initialisePheromoneValues();
}


function ConstructedGraphNode(label, originalEdge) {
    /**
     * Represents a single node on the directed construction graph.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param label - String label of this node
     * @param originalEdge - GraphNodeEdge that this node represents on the input graph
     */

    this.label = label;
    this.originalEdge = originalEdge;
    this.edges = [];
    var self = this;

    this.getLabel = function() {
        return self.label;
    };

    this.getOriginalEdge = function() {
        return self.originalEdge;
    };

    this.getEdges = function() {
        return self.edges;
    };

    this.setEdges = function(edges) {
        self.edges = edges;
    };
}


function ConstructedGraphNodeEdge(from, to) {
    /**
     * Represents a single edge on the construction graph.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param from - String label of first node edge is connected to
     * @param to - String label of second node edge is connected to
     */

    this.from = from;
    this.to = to;
    this.tau = 0;
    this.eta = 0;
    var self = this;


    this.getFrom = function() {
        return self.from;
    };

    this.getTo = function() {
        return self.to;
    };

    this.getPheromone = function() {
        return self.tau;
    };

    this.setPheromone = function(tau) {
        self.tau = tau;
    };

    this.getEta = function() {
        return self.eta;
    };

    this.setEta = function(eta) {
        self.eta = eta;
    };
}
