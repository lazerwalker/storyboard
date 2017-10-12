"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var nodeBag_1 = require("../src/nodeBag");
var Actions = require("../src/gameActions");
var state_1 = require("../src/state");
chai.use(sinonChai);
var expect = chai.expect;
describe("filtering nodes", function () {
    context("when some nodes match the predicate but others don't", function () {
        it("should only return the nodes that match", function () {
            var bagData = {
                first: { nodeId: "first", predicate: { "foo": { "lte": 10 } }, track: "default" },
                second: { nodeId: "second", predicate: { "foo": { "lte": 9 } }, track: "default" },
                third: { nodeId: "third", predicate: { "foo": { "lte": 0 } }, track: "default" }
            };
            var action, data;
            function dispatch(passedAction, passedData) {
                expect(passedAction).to.equal(Actions.TRIGGERED_BAG_NODES);
                var firstNode = bag.nodes["first"];
                var secondNode = bag.nodes["second"];
                expect(passedData).to.eql({ "default": [firstNode, secondNode] });
            }
            var bag = new nodeBag_1.Bag(bagData, dispatch);
            var state = new state_1.State();
            state.foo = "5";
            bag.checkNodes(state);
        });
    });
});
