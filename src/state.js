"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var State = /** @class */ (function () {
    function State() {
        this.graph = new GraphState();
        this.bag = new BagState();
    }
    return State;
}());
exports.State = State;
var GraphState = /** @class */ (function () {
    function GraphState() {
        this.choiceHistory = [];
        this.nodeHistory = [];
    }
    return GraphState;
}());
exports.GraphState = GraphState;
var BagState = /** @class */ (function () {
    function BagState() {
        this.activePassageIndexes = {};
        this.nodeHistory = {};
        this.activeTracks = {};
    }
    return BagState;
}());
exports.BagState = BagState;
