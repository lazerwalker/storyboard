"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var Actions = require("../src/gameActions");
var state_1 = require("../src/state");
var game_1 = require("../src/game");
chai.use(sinonChai);
var expect = chai.expect;
describe("filtering nodes", function () {
    context("when some nodes match the predicate but others don't", function () {
        it("should only return the nodes that match", function () {
            var story = "\n        ## first\n          [foo <= 10]\n          track: default\n\n        ## second\n          [foo <= 9]\n          track: default\n\n        ## third\n          [foo <= 0]\n          track: default\n      ";
            var game = new game_1.Game(story);
            var bag = game.story.bag;
            console.log(JSON.stringify(bag.nodes, null, 3));
            var action, data;
            bag.dispatch = function (passedAction, passedData) {
                expect(passedAction).to.equal(Actions.TRIGGERED_BAG_NODES);
                var firstNode = bag.nodes["first"];
                var secondNode = bag.nodes["second"];
                console.log(passedData);
                expect(passedData).to.eql({ "default": [firstNode, secondNode] });
            };
            var state = new state_1.State();
            state.foo = "5";
            bag.checkNodes(state);
        });
    });
});
