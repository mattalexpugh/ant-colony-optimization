function CycleFinder() {
    /**
     * Detects cycles in proposed MSTs with proposed new edges, through comparison
     * of nodes present using shallow analysis, deeper analysis uses recursion to
     * follow trails in all directions of the graph trying to find an existing path.
     *
     * Developed by Matthew Pugh for SE36010 at Aberystwyth University,
     * May 2013. Contact the author at map13@aber.ac.uk.
     */

    var pathFindingEdges = {};
    var self = this;

    this.findPath = function(mst, edge, from, to) {
        /**
         * Recursively traverses the graph structure, finding a path between
         * from and to.
         *
         * @param mst - GraphNodeEdge[] - the current state of the MST to be evaluated
         * @param edge - GraphNodeEdge - the proposed edge to be evaluated
         * @param from - String label of journey start
         * @param to - String label of journey end
         * @return GraphNodeEdge[] discovered path
         */

        var cEdge, candidate;
        var nextNode = (edge.getTo() == from) ? edge.getFrom() : edge.getTo();
        var path = [];
        var found = false;

        for (var i = 0; i < mst.length; i++) {

            if (found) {
                continue;
            }

            cEdge = mst[i];
            candidate = null;

            // We are looking for the next edge that has a link to the node identified
            // so that we can build a chain.
            if ((cEdge.contains(nextNode)) &&
                (!_.has(pathFindingEdges, "" + cEdge.getTo() + cEdge.getFrom()))) {
                candidate = cEdge;
            }

            if (candidate) {

                path.push(candidate);
                candidateKey = "" + candidate.getTo() + candidate.getFrom();
                pathFindingEdges[candidateKey] = true;

                if (candidate.contains(to)) {
                    found = true;
                } else {
                    path = path.concat(self.findPath(mst, candidate, nextNode, to));
                }
            }
        }

        return path;
    };

    this.causesCycle = function(mst, proposed) {
        /**
         * Evaluates the provided MST with the proposed edge for cycle-forming
         * issues, first using a performant shallow-analysis, then using a
         * recursive deep-analysis.
         *
         * @param mst - GraphNodeEdge[] the current state of the MST to be evaluated
         * @param proposed - GraphNodeEdge to be evaluated
         * @return bool true if proposed edge causes a cycle.
         */

        var A = proposed.getFrom(), B = proposed.getTo();
        var nodesReferenced = {};

        // First performant check, see if A and B exist in
        // the edges selected, if not, there cannot be a link
        var e;

        for (var i = 0; i < mst.length; i++) {
            e = mst[i];
            nodesReferenced[e.getTo()] = true;
            nodesReferenced[e.getFrom()] = true;
        }

        var test = ((!_.has(nodesReferenced, A)) || (! _.has(nodesReferenced, B)));

        if (test) {
            return false;
        }

        // Deeper analysis, if a path already exists between A and B,
        // then a loop would occur. A -> B === B -> A as undirected.
        // Code focuses on A -> B
        var candidate = null, currentEdge;
        var edgeA, edgeB;
        var path, candidateKey;
        pathFindingEdges = {};
        var test1 = false, test2 = false, found = false;

        for (i = 0; i < mst.length; i++) {

            if (found) {
                continue;
            }

            currentEdge = mst[i];
            candidate = null;

            if (currentEdge.contains(A)) {
                candidate = currentEdge;
            }

            if (candidate) {
                candidateKey = "" + candidate.getTo() + candidate.getFrom();
                pathFindingEdges[candidateKey] = true;
                path = self.findPath(mst, candidate, A, B);

                if (path.length === 0) {
                    continue;
                }

                edgeA = currentEdge;
                edgeB = _.last(path);

                test1 = (edgeA.contains(A));
                test2 = (edgeB.contains(B));

                found = (test1 && test2);
            }
        }

        return found;
    };

}

