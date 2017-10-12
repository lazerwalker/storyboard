"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
var predicate_1 = require("./predicate");
var Actions = require("./gameActions");
var node_1 = require("./node");
var Bag = /** @class */ (function () {
    function Bag(nodes, dispatch) {
        this.dispatch = dispatch;
        this.nodes = _.mapObject(nodes || {}, function (node, key) {
            // TODO: Rip this out into a "BagNode" object? Should these apply to normal nodes?
            if (!node.predicate) {
                node.predicate = {};
            }
            var newPredicate = {
                track: "default"
            };
            var activeKeyPath = "bag.activePassageIndexes." + node.nodeId;
            newPredicate[activeKeyPath] = { "exists": false };
            if (!node.allowRepeats) {
                var finishedKeypath = "bag.nodeHistory." + node.nodeId;
                newPredicate[finishedKeypath] = { "exists": false };
            }
            node.predicate = Object.assign({}, node.predicate, newPredicate);
            return new node_1.Node(node, dispatch);
        });
    }
    Bag.prototype.checkNodes = function (state) {
        var filteredNodes = _.filter(this.nodes, function (node) { return predicate_1.default(node.predicate, state); });
        if (filteredNodes.length > 0 && this.dispatch) {
            var nodesByTrack = _.groupBy(filteredNodes, "track");
            this.dispatch(Actions.TRIGGERED_BAG_NODES, nodesByTrack);
        }
    };
    Bag.prototype.playCurrentPassage = function (nodeId, state) {
        var node = this.nodes[nodeId];
        if (!node)
            return;
        var passageIndex = state.bag.activePassageIndexes[nodeId];
        node.playPassage(passageIndex);
    };
    Bag.prototype.completePassage = function (passageId, state) {
        var _this = this;
        var node = _(state.bag.activePassageIndexes).chain()
            .keys()
            .map(function (nodeId) { return _this.nodes[nodeId]; })
            .find(function (node) {
            return _(node.passages).chain()
                .pluck('passageId')
                .contains(passageId)
                .value();
        }).value();
        if (!node)
            return;
        var currentIndex = state.bag.activePassageIndexes[node.nodeId];
        var currentPassage = node.passages[currentIndex];
        if (passageId !== currentPassage.passageId)
            return;
        var newIndex = currentIndex + 1;
        if (newIndex >= node.passages.length) {
            this.dispatch(Actions.COMPLETE_BAG_NODE, node.nodeId);
        }
        else {
            this.dispatch(Actions.CHANGE_BAG_PASSAGE, [node.nodeId, newIndex]);
        }
    };
    return Bag;
}());
exports.Bag = Bag;
