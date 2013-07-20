var ACO_RUNNING = false;
var graphData = graph1; // Default

var resetGraphs = function() {
    $('#graph-canvas-input, #graph-canvas-mst, #graph-canvas-output, #graph-canvas-constructed').html('');
};

var runACO = function() {

    ACO_RUNNING = true;

    var sigRootInput, sigInstInput;
    var sigRootMST, sigInstMST;
    var sigRootACO, sigInstACO;
    var sigRootConstructed, sigInstConstructed;
    var sigNodeCoords = {}, sigConstructedNodeCoords = {};
    var inputGraph, constructed, aco, mst;

    var alpha = parseFloat($('#param-alpha').val());
    var beta = parseFloat($('#param-beta').val());
    var rho = parseFloat($('#param-rho').val());
    var iters = parseFloat($('#param-sigma').val());

    inputGraph = new UndirectedGraph(graphData);
    mst = inputGraph.getMSTObject();
    constructed = new ConstructedGraph(inputGraph);
    aco = new AntColonyOptimiser(constructed, alpha, beta, rho, iters);

    resetGraphs();

    sigRootInput = document.getElementById('graph-canvas-input');
    sigInstInput = sigma.init(sigRootInput);

    sigRootMST = document.getElementById('graph-canvas-mst');
    sigInstMST = sigma.init(sigRootMST);

    sigRootACO = document.getElementById('graph-canvas-output');
    sigInstACO = sigma.init(sigRootACO);

    sigRootConstructed = document.getElementById('graph-canvas-constructed');
    sigInstConstructed = sigma.init(sigRootConstructed);

    var labels = inputGraph.getLabels();
    var edges = inputGraph.getAllEdges();
    var drawnEdges = [], edgeKey;
    var nodeX, nodeY;
    var nodeSize = 12, nodeLabel;

    // Apply the nodes with the same x, y coords to all 3 graphs
    for (var i = 0; i < labels.length; i++) {
        nodeLabel = labels[i];
        nodeX = Math.random();
        nodeY = Math.random();

        sigNodeCoords[nodeLabel] = [nodeX, nodeY];

        sigInstInput.addNode(nodeLabel, {
            x: nodeX,
            y: nodeY,
            size: nodeSize,
            label: nodeLabel,
            color: '#444'
        });

        sigInstMST.addNode(nodeLabel, {
            x: nodeX,
            y: nodeY,
            size: nodeSize,
            label: nodeLabel,
            color: '#ff0000'
        });

        sigInstACO.addNode(nodeLabel, {
            x: nodeX,
            y: nodeY,
            size: nodeSize,
            label: nodeLabel,
            color: '#3a87ad'
        }).draw();
    }

    var edge;

    // Do the edges for the (known) input & MST
    for (i = 0; i < edges.length; i++) {
        edge = edges[i];
        edgeKey = edge.getFrom() + edge.getTo();

        if (! _.has(drawnEdges, edgeKey)) {
            sigInstInput.addEdge(edgeKey, edge.getFrom(), edge.getTo()).draw();
            drawnEdges.push(edgeKey);
        }
    }

    for (i = 0; i < inputGraph.getMST().length; i++) {
        edge = inputGraph.getMST()[i];
        edgeKey = 'MST-' + edge.getFrom() + edge.getTo();

        sigInstMST.addEdge(edgeKey, edge.getFrom(), edge.getTo(), {
            color: '#ff0000'
        }).draw();
    }

    // Construction graph stuff here
    var constructedLabels = constructed.getLabels();
    var constructedEdges = constructed.getAllEdges();

    for (i = 0; i < constructedLabels.length; i++) {
        nodeLabel = constructedLabels[i];
        nodeX = Math.random() * 2.5;
        nodeY = Math.random();

        sigConstructedNodeCoords[nodeLabel] = [nodeX, nodeY];

        sigInstConstructed.addNode(nodeLabel, {
            x: nodeX,
            y: nodeY,
            size: nodeSize * 0.75,
            label: nodeLabel,
            color: '#3cd499'
        }).draw();
    }

    for (i = 0; i < constructedEdges.length; i++) {
        edge = constructedEdges[i];
        edgeKey = 'CONST' + edge.getFrom() + edge.getTo();

        sigInstConstructed.addEdge(edgeKey, edge.getFrom(), edge.getTo(), {
            color: '#3cd499'
        }).draw();
    }

    // Dynamic Graph Data Loading
    $('#graph-data-source').html(JSON.stringify(graphData, undefined, 4));
    $('#mst-data').html(mst.toString(true));
    $('#btn-update-graph').click(function() {
        graphData = $.parseJSON($('#graph-data-source').html());
        runACO();
    });

    // Run ACO and update the third graph
    aco.run();
    var path = aco.bestSolution;
    var origEdge;

    for (i = 0; i < path.length; i++) {
        edge = path[i];
        origEdge = edge.getOriginalEdge();
        edgeKey = "ACO-" + origEdge.getFrom() + origEdge.getTo();

        sigInstACO.addEdge(edgeKey, origEdge.getFrom(), origEdge.getTo(), {
            color: '#3a87ad'
        }).draw();
    }

    // Update the details for each graph
    var details = {
        input: $('#details-input'),
        mst: $('#details-mst'),
        aco: $('#details-aco')
    };

    details['input'].html('m = ' + inputGraph.getNumEdges() + ", n = " + inputGraph.getNumNodes());
    details['mst'].html('m = ' + mst.getNumEdges() + ", n = " + mst.getNumNodes() + ", w = " + mst.totalWeight());
    details['aco'].html('m = ' + aco.getNumEdges() + ", n = " + mst.getNumNodes() + ", w = " + aco.totalWeight() + ", i = " + aco.getItersTaken() + "/" + aco.getItersMax() + ", a = " + aco.getItersTakenBest());

    ACO_RUNNING = false;
};
