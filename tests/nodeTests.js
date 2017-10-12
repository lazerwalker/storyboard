"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon = require("sinon");
chai.use(sinonChai);
var expect = chai.expect;
var game_1 = require("../src/game");
var state_1 = require("../src/state");
var keyPathify_1 = require("../src/keyPathify");
describe("setting variables", function () {
    context("within the graph", function () {
        var game, callback;
        beforeEach(function () {
            var story = "\n        # node\n          set foo to bar\n          set baz to graph.currentNodeId\n      ";
            game = new game_1.Game(story);
            callback = sinon.spy();
            game.addOutput("text", callback);
            game.state.rngSeed = "knownSeed";
            game.start();
        });
        afterEach(function () {
            var state = new state_1.State();
            state.rngSeed = "erase";
            keyPathify_1.default(undefined, state);
        });
        it("should set variable literals", function () {
            expect(game.state.foo).to.equal("bar");
        });
        it("should set keypath variables", function () {
            expect(game.state.baz).to.equal("node");
        });
        context("functionality not yet in the lang", function () {
            beforeEach(function () {
                game = new game_1.Game({
                    "graph": {
                        "start": "node",
                        "nodes": {
                            "node": {
                                "nodeId": "node",
                                "passages": [
                                    {
                                        "passageId": "1",
                                        "set": {
                                            "random1": { randInt: [0, 6] },
                                            "random2": { randInt: [0, 6] }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });
                callback = sinon.spy();
                game.addOutput("text", callback);
                game.state.rngSeed = "knownSeed";
                game.start();
            });
            it("should set random numbers", function () {
                expect(game.state.random1).to.equal(4);
                expect(game.state.random2).to.equal(1);
            });
        });
        context("when the passage also has content in it", function () {
            beforeEach(function () {
                var story = "\n          # node\n            set foo to bar\n            set baz to graph.currentNodeId\n            text: Hi there!\n        ";
                game = new game_1.Game(story);
                console.log(JSON.stringify(game.story, null, 3));
                callback = sinon.spy();
                game.addOutput("text", callback);
                game.start();
            });
            it("should output the content", function () {
                expect(callback).to.have.been.calledWith("Hi there!", sinon.match.any);
            });
            it("should set the variable", function () {
                expect(game.state.foo).to.equal("bar");
            });
            it("should set keypath variables", function () {
                expect(game.state.baz).to.equal("node");
            });
        });
    });
    context("within the bag", function () {
        var game, callback;
        beforeEach(function () {
            var story = "\n        ## node\n          set foo to bar\n          set baz to bag.activePassageIndexes.node\n          text: Hi there!\n      ";
            game = new game_1.Game(story);
            var callback = sinon.spy();
            game.addOutput("text", callback);
            game.state.rngSeed = "knownSeed";
            game.start();
        });
        afterEach(function () {
            var state = new state_1.State();
            state.rngSeed = "erase";
            keyPathify_1.default(undefined, state);
        });
        it("should set variable literals", function () {
            expect(game.state.foo).to.equal("bar");
        });
        it("should set keypath variables", function () {
            expect(game.state.baz).to.equal(1);
        });
        context("functionality not yet in the lang", function () {
            beforeEach(function () {
                game = new game_1.Game({
                    "bag": {
                        "node": {
                            "nodeId": "node",
                            "passages": [
                                {
                                    "passageId": "1",
                                    "set": {
                                        "foo": "bar",
                                        "baz": "bag.activePassageIndexes.node",
                                        "random1": { "randInt": [0, 6] },
                                        "random2": { "randInt": [0, 6] }
                                    }
                                }
                            ]
                        }
                    }
                });
                var callback = sinon.spy();
                game.addOutput("text", callback);
                game.state.rngSeed = "knownSeed";
                game.start();
            });
            it("should set random numbers", function () {
                expect(game.state.random1).to.equal(4);
                expect(game.state.random2).to.equal(1);
            });
        });
    });
});
