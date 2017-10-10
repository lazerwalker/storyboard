"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
var predicate_1 = require("./predicate");
var Actions = require("./gameActions");
var node_1 = require("./node");
var Graph = (function () {
    function Graph(graph, dispatch) {
        if (graph) {
            this.nodes = _.mapObject(graph.nodes, function (n) { return new node_1.Node(n, dispatch); });
            this.start = graph.start;
        }
        this.dispatch = dispatch;
    }
    Graph.prototype.completePassage = function (passageId, state) {
        var currentNode = this._nodeWithId(state.graph.currentNodeId);
        if (!currentNode || !currentNode.passages || _.isUndefined(state.graph.currentPassageIndex))
            return;
        var currentPassage = currentNode.passages[state.graph.currentPassageIndex];
        if (passageId !== currentPassage.passageId)
            return;
        this.startNextPassage(state);
    };
    Graph.prototype.startNextPassage = function (state) {
        var currentNode = this._nodeWithId(state.graph.currentNodeId);
        if (!currentNode || _.isUndefined(state.graph.currentPassageIndex))
            return;
        var found = false;
        var newPassageIndex = state.graph.currentPassageIndex;
        while (!found) {
            newPassageIndex = newPassageIndex + 1;
            if (_.isUndefined(currentNode.passages) || newPassageIndex >= currentNode.passages.length) {
                found = true;
                this.dispatch(Actions.COMPLETE_GRAPH_NODE, currentNode.nodeId);
            }
            else {
                var newPassage = currentNode.passages[newPassageIndex];
                if ((!newPassage.predicate) || predicate_1.default(newPassage.predicate, state)) {
                    found = true;
                    this.dispatch(Actions.CHANGE_GRAPH_PASSAGE, newPassageIndex);
                }
            }
        }
    };
    Graph.prototype.checkChoiceTransitions = function (state) {
        var node = this._nodeWithId(state.graph.currentNodeId);
        if (!(state.graph.nodeComplete && node && node.choices)) {
            return;
        }
        var choices = node.choices.filter(function (choice) {
            return predicate_1.default(choice.predicate, state);
        });
        if (choices.length > 0 && this.dispatch) {
            this.dispatch(Actions.MAKE_GRAPH_CHOICE, choices[0]);
        }
    };
    Graph.prototype.playCurrentPassage = function (state) {
        var node = this._nodeWithId(state.graph.currentNodeId);
        var passageIndex = state.graph.currentPassageIndex;
        if (!node || _.isUndefined(passageIndex))
            return;
        node.playPassage(passageIndex);
    };
    //--
    Graph.prototype._nodeWithId = function (nodeId) {
        if (nodeId) {
            return this.nodes[nodeId];
        }
    };
    return Graph;
}());
exports.Graph = Graph;
