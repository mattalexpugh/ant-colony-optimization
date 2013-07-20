function MinimumSpanningTree(inputGraph) {
    /**
     * Computes a MST for an undirected, weighted UndirectedGraph object using
     * Kruskal's algorithm.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param inputGraph - UndirectedGraph object to find MST for.
     */

    this.undirectedGraph = inputGraph;
    this.cycleFinder = new CycleFinder();
    this.mst = [];
    this.edges;
    this.pathFindingEdges = {};
    this.possibleEdges = [];
    var self = this;

    this.getGraph = function() {
        return self.undirectedGraph;
    };

    this.getCycleFinder = function() {
        return this.cycleFinder;
    };

    this.getMST = function() {
        return self.mst;
    };

    this.getNumEdges = function() {
        return self.size();
    };

    this.getNumNodes = function() {
        return self.undirectedGraph.getNumNodes();
    };

    this.size = function() {
        return self.mst.length;
    };

    this.isConnected = function() {
        /**
         * Ascertains if the resultant tree is a connected graph. Performs
         * this based on knowledge that number of edges = (M - 1), where M
         * is the number of nodes present on the input graph.
         *
         * @return bool - true if connected
         */
        return (self.size() == (self.undirectedGraph.getNumNodes() - 1));
    };

    var removePossibleEdge = function(edge) {
        self.possibleEdges = _.without(self.possibleEdges, edge);
        numUsableEdges = self.possibleEdges.length;
    };

    var computeMST = function() {
        /**
         * Computes the MST of the input graph using Kruskal's algorithm.
         */

        self.mst = [];
        self.possibleEdges = self.edges = self.getGraph().getAllEdges(true);
        var numEdges = self.getGraph().getNumEdges();
        numUsableEdges = self.possibleEdges.length;
        var grouped, nextGroup, groupKeys, minWeight;
        var selectedIdx, selected, i;
        var MAX_ITERS = 30;
        var current_iter = 1;

        while ((numUsableEdges > 0) && (current_iter < MAX_ITERS)) {

            grouped = {};
            var e;

            for (var j = 0; j < self.possibleEdges.length; j++) {
                e = self.possibleEdges[j];

                try {
                    grouped[e.getWeight()].push(e);
                } catch (err) {
                    grouped[e.getWeight()] = [e];
                }
            }

            // Find out what the lowest grouped weight is as a key.
            groupKeys = _.keys(grouped);
            minWeight = _.min(groupKeys);
            nextGroup = grouped[minWeight];

            if (nextGroup.length > 1) {
                i = 1;

                // XOR in JS, terminate if either run out of edges or a suitable one found.
                while ((i != nextGroup.length) ? !(selected != null) : (selected !== null)) {

                    selectedIdx = Math.floor(Math.random() * nextGroup.length);
                    selected = nextGroup[selectedIdx];

                    if (self.getCycleFinder().causesCycle(self.mst, selected)) {
                        removePossibleEdge(selected);
                        selected = null;
                    }

                    i++;
                }
            } else {
                selected = grouped[minWeight][0];

                if (self.getCycleFinder().causesCycle(self.mst, selected)) {
                    removePossibleEdge(selected);
                    selected = null;
                }
            }

            // If we're here and selected isn't null, it's the next node in the tree
            if (selected) {
                self.mst.push(selected);
                removePossibleEdge(selected);
                selected = null;
            }

            current_iter++;
        }
    };

    this.totalWeight = function() {

        var totalWeight = 0;
        var edge;

        for (var i = 0; i < self.mst.length; i++) {
            edge = self.mst[i];
            totalWeight += edge.getWeight();
        }

        return totalWeight;
    };

    this.toString = function(html) {
        html = html || false;
        var output = (html) ? "<ol>" : "", tmpLine;

        for (var i = 0; i < self.size(); i++) {
            tmpLine = self.mst[i].getFrom() + " <=> " + self.mst[i].getTo();
            tmpLine += " w=" + self.mst[i].getWeight();

            output += (html) ? "<li>" + tmpLine + "</li>" : tmpLine;
        }

        return output;
    };

    computeMST();
}
