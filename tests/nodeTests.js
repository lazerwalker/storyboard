"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon_1 = require("sinon");
chai.use(sinonChai);
var expect = chai.expect;
var game_1 = require("../src/game");
var state_1 = require("../src/state");
var keyPathify_1 = require("../src/keyPathify");
describe("setting variables", function () {
    context("within the graph", function () {
        var game, callback;
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
                                        "foo": "bar",
                                        "baz": "graph.currentNodeId",
                                        "random1": { randInt: [0, 6] },
                                        "random2": { randInt: [0, 6] }
                                    }
                                }
                            ]
                        }
                    }
                }
            });
            callback = sinon_1.spy();
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
        it("should set random numbers", function () {
            expect(game.state.random1).to.equal(4);
            expect(game.state.random2).to.equal(1);
        });
        context("when the passage also has content in it", function () {
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
                                        "type": "text",
                                        "content": "Hi There!",
                                        "set": {
                                            "foo": "bar",
                                            "baz": "graph.currentNodeId"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });
                callback = sinon_1.spy();
                game.addOutput("text", callback);
                game.start();
            });
            it("should output the content", function () {
                expect(callback).to.have.been.calledWith("Hi There!", "1");
            });
            it("should set the variable", function () {
                expect(game.state.foo).to.equal("bar");
            });
        });
    });
    context("within the bag", function () {
        var game, callback;
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
            var callback = sinon_1.spy();
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
            expect(game.state.baz).to.equal(0);
        });
        it("should set random numbers", function () {
            expect(game.state.random1).to.equal(4);
            expect(game.state.random2).to.equal(1);
        });
    });
});
