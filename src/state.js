"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var State = (function () {
    function State() {
        this.graph = new GraphState();
        this.bag = new BagState();
    }
    return State;
}());
exports.State = State;
var GraphState = (function () {
    function GraphState() {
        this.choiceHistory = [];
        this.nodeHistory = [];
    }
    return GraphState;
}());
exports.GraphState = GraphState;
var BagState = (function () {
    function BagState() {
        this.activePassageIndexes = {};
        this.nodeHistory = {};
        this.activeTracks = {};
    }
    return BagState;
}());
exports.BagState = BagState;
