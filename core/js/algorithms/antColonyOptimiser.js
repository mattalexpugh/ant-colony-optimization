function AntColonyOptimiser(graph, alpha, beta, rho, sigma) {
    /**
     * Implementation of 1-ANT ACO algorithm as described by Neumann & Witt.
     * Pheromone value update differs though, based on Neumann, Doerr & Sudholt.
     * Creates a resultant MST at each iteration. Updates the best solution based
     * on weighting comparison. Algorithm converges if the MST weight is the same
     * as the target MST, given by the UndirectedGraph variable graph, or all
     * iterations have passed.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     *
     * @param graph - Compiled UndirectedGraph object
     * @param alpha - float alpha value for ACO as per Neumann & Witt
     * @param beta - float beta value for ACO as per Neumann & Witt
     * @param rho - float rho value for pheromone update, as per Neumann, Doerr & Sudholt
     * @param sigma - int max number of iterations in optimisation run
     */

    this.constructedGraph = graph;
    this.undirectedGraph = graph.getUndirectedGraph();
    this.cycleFinder = new CycleFinder();

    this.alpha = alpha;
    this.beta = beta;
    this.rho = rho;

    this.selectedEdges = [];
    this.visitedNodes = [];
    this.wouldCauseCycle = [];

    this.bestSolution = null;
    this.iters = sigma || 5; // Num of iters on same params
    this.itersTaken = 0;
    this.itersTakenBest = 0;
    this.currentNode;

    // var pathFindingEdges = {};

    var self = this;

    this.getConstructedGraph = function() {
        return self.constructedGraph;
    };

    this.getUndirectedGraph = function() {
        return self.undirectedGraph;
    };

    this.getCycleFinder = function() {
        return this.cycleFinder;
    };

    this.getAlpha = function() {
        return self.alpha;
    };

    this.getBeta = function() {
        return self.beta;
    };

    this.getRho = function() {
        return self.rho;
    };

    this.getItersTaken = function() {
        /**
         * Returns the number of iterations used out of the maximum in total.
         *
         * @return int number of iterations
         */
        return self.itersTaken;
    };

    this.getItersTakenBest = function() {
        /**
         * Returns the number of iterations needed to find the best solution.
         *
         * @return int number of iterations
         */
        return self.itersTakenBest;
    };

    this.getItersMax = function() {
        return self.iters;
    };

    this.getSelectedEdges = function() {
        return self.selectedEdges;
    };

    this.getNumEdges = function() {
        return self.bestSolution.length;
    };

    this.addSelectedEdge = function(edge) {
        self.selectedEdges.push(edge);
        self.currentNode = self.getConstructedGraph().getNode(edge.getTo());
        self.visitedNodes.push(self.currentNode);
    };

    this.removeCycleFormers = function(available, visited) {
        /**
         * Compares available nodes with those already visited and
         * ascertains which would cause a cycle on the input graph.
         * Once isolated, they are removed from the available nodes.
         *
         * @param available ConstructionGraphNodes[] - not visited
         * @param visited ConstructionGraphNodes[] - previously visited
         * @return ConstructionGraphNodes[] - eligible nodes for selection
         */

        // Setup result and remove known offenders
        var result = _.difference(available, self.wouldCauseCycle);
        var localMST = [];
        var toBeRemoved = [];
        var node, edge;

        for (var i = 0; i < visited.length; i++) {
            node = visited[i];
            localMST.push(node.getOriginalEdge());
        }

        for (i = 0; i < result.length; i++) {
            node = result[i];
            edge = node.getOriginalEdge();

            if (self.getCycleFinder().causesCycle(localMST, edge)) {
                self.wouldCauseCycle.push(node);
                toBeRemoved.push(node);
            }
        }

        result = _.difference(result, toBeRemoved);

        return result;
    };

    this.getAvailableNodes = function() {
        /* (E \ {v1, v2, ... , vk}) */
        var nodes = self.getConstructedGraph().getAllNodes(true);
        var visited = self.visitedNodes;
        var availableNodes = _.difference(nodes, visited);

        /* \ {e ∈ E | (V , {v1 , . . . , vk , e}
         * where doesn't cause a cycle. */
        availableNodes = self.removeCycleFormers(availableNodes, visited);

        return availableNodes;
    };

    this.findNeighbourhood = function() {
        /**
         * Find the available nodes not visited and will not cause a cycle.
         * Then find the edges from the current node to these available nodes,
         * this is the neighbourhood.
         *
         * @return ConstructionGraphNodes[] - eligible nodes for selection
         */

        var availableNodes = self.getAvailableNodes();
        var availableNodeKeys = {};
        var n;

        for (var i = 0; i < availableNodes.length; i++) {
            n = availableNodes[i];
            availableNodeKeys[n.getLabel()] = true;
        }

        var availableEdges = [];

        // We want the edges going from self.currentNode to any node in availableNodeKeys
        var allEdges = self.getConstructedGraph().getAllEdges();

        var filteredEdges = _.filter(allEdges, function(e) {
            return (e.getFrom() == self.currentNode.getLabel());
        });

        availableEdges = _.filter(filteredEdges, function(e) {
            return (_.has(availableNodeKeys, e.getTo()));
        });

        return availableEdges;
    };

    this.updatePheromones = function() {
        var pheromoneValue, tmpPh, mx;
        var firstComponent = 1 - self.getRho();
        var constructed = self.getConstructedGraph();
        var undirected = self.getUndirectedGraph();
        var m = undirected.getNumEdges();
        var n = undirected.getNumNodes();
        var log2n = (Math.log(n) / Math.log(2)); // No native log2

        // So we update the pheromone values based on the edges chosen of the 
        // original graph via the nodes of the constructed. To do this, we
        // compare the visited nodes to the nodes of the constructed graph
        // and make two sets, selected and unselected. Edges to each of these
        // in the construction graph have their pheromone values updated
        // accordingly.
        var selected = self.visitedNodes;
        var notSelected = _.difference(self.getConstructedGraph().getAllNodes(true), selected);
        var allEdges = self.getConstructedGraph().getAllEdges();
        var node, e, edgesToNode;

        for (var i = 0; i < selected.length; i++) {
            node = selected[i];

            edgesToNode = _.filter(allEdges, function(edge) {
                return (edge.getTo() == node.getLabel());
            });

            for (var j = 0; j < edgesToNode.length; j++) {
                e = edgesToNode[j];
                tmpPh = (firstComponent * e.getPheromone()) + self.getRho();
                pheromoneValue = (tmpPh > 1) ? 1 : tmpPh; // min
                e.setPheromone(pheromoneValue);
            }
        }

        for (i = 0; i < notSelected.length; i++) {
            node = notSelected[i];

            edgesToNode = _.filter(allEdges, function(edge) {
                return (edge.getTo() == node.getLabel());
            });

            for (j = 0; j < edgesToNode.length; j++) {
                e = edgesToNode[j];
                //max{tmpPh, 1 / ((m - n + 1)log_2(n))
                tmpPh = firstComponent * e.getPheromone();
                mx = 1 / ((m - n - 1) * log2n);
                pheromoneValue = (tmpPh > mx) ? tmpPh : mx; // max
                e.setPheromone(pheromoneValue);
            }
        }
    };

    var probabilityOfEdge = function(edge) {
        /**
         * Determines the probability of the current edge through
         * p(e) = τ(e)^a * n(e)^b
         *
         * @param ConstructionGraphEdge to be evaluated
         * @return float - probability
         */

        var a = self.getAlpha();
        var b = self.getBeta();
        var tau = edge.getPheromone();
        var eta = edge.getEta();
        var p = (Math.pow(tau, a) * Math.pow(eta, b));

        return p;
    };

    var runStep = function() {
        /**
         * An iteration step in the ACO algorithm, returns the selected
         * edge.
         *
         * @return ConstructionGraphEdge that has been randomly selected
         */

        var N = self.findNeighbourhood();
        var R = 0;
        var e;

        // Sum of probabilities
        for (var i = 0; i < N.length; i++) {
            e = N[i];
            R += probabilityOfEdge(e);
        }

        // Random number in space [0, ..., R]
        var randNum = Math.random() * R;
        var pv, v, vTotal = 0;
        var selected = null;

        // Keep iterating through until the cumulative
        // sum of encountered probabilities is less than
        // the randNum variable, then we have found
        // the next edge.
        for (i = 0; i < N.length; i++) {
            v = N[i];
            pv = probabilityOfEdge(v);
            vTotal += pv;

            if (vTotal >= randNum) {
                selected = v;
                break;
            }
        }

        return selected;
    };

    this.run = function() {
        /**
         * Runs the ACO algorithm for the amount of iterations defined in
         * object instantiation.
         */

        var graph = self.getConstructedGraph();
        var targetMet = false;

        for (var run_iter = 0; run_iter < self.iters; run_iter++) {

            if (targetMet) {
                continue;
            }

            var s0 = graph.getNode('0');
            var discoveredTree = [];
            self.currentNode = s0;
            self.visitedNodes = [];
            self.selectedEdges = [];
            self.wouldCauseCycle = [];
            var selectedEdge = true;

            while (selectedEdge !== null) {
                selectedEdge = runStep();

                if (selectedEdge) {
                    discoveredTree.push(self.getConstructedGraph().getNode(selectedEdge.getTo()));
                    self.addSelectedEdge(selectedEdge);
                }
            }

            self.itersTaken++;
            targetMet = self.fitness(discoveredTree);
        }
    };

    this.fitness = function(proposedMST) {
        /**
         * Calculates the fitness of the proposed path the last ant walked,
         * if it is the best so far, updates the best solution and number of
         * ants taken. If the best solution weighting matches that of the target,
         * returns true to signify that the algorithm has reached its stopping
         * criterion.
         *
         * @param proposedMST - ConstructionGraphNode[] the ant's walk
         * @return bool - algorithm converged
         */

        if (self.bestSolution === null) {
            self.bestSolution = proposedMST;
        }

        var bestWeight = self.totalWeight(), proposedWeight = 0;
        var edge;

        for (var i = 0; i < proposedMST.length; i++) {
            edge = proposedMST[i];
            proposedWeight += edge.getOriginalEdge().getWeight();
        }

        if (proposedWeight <= bestWeight) {
            self.bestSolution = proposedMST;
            bestWeight = proposedWeight;
            self.itersTakenBest = self.itersTaken;
        }

        var targetWeight = self.getUndirectedGraph().getMSTObject().totalWeight();

        return (bestWeight <= targetWeight);
    };

    this.totalWeight = function() {
        /**
         * Sums the weight of the best solution thus far using:
         * f(x) = w1 + w2 + ... + wm
         *
         * @return int - sum of edge weights.
         */

        var bestWeight = 0;
        var edge;

        for (var i = 0; i < self.bestSolution.length; i++) {
            edge = self.bestSolution[i];
            bestWeight += edge.getOriginalEdge().getWeight();
        }

        return bestWeight;
    };
}
