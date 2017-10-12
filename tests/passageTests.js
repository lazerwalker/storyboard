"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon_1 = require("sinon");
chai.use(sinonChai);
var expect = chai.expect;
var game_1 = require("../src/game");
describe("'wait' passages", function () {
    var game, callback;
    beforeEach(function () {
        game = new game_1.Game({
            "graph": {
                "start": "theNode",
                "nodes": {
                    "theNode": {
                        "nodeId": "theNode",
                        "passages": [
                            {
                                "passageId": "1",
                                "type": "wait",
                                "content": "5"
                            },
                            {
                                "passageId": "2",
                                "type": "text",
                                "content": "You made it!"
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
    context("immediately", function () {
        it("should not play the next passage yet", function () {
            expect(callback).not.to.have.been.calledWith("You made it!", "2");
        });
    });
    context("after enough time has passed", function () {
        it("should play the next passage", function (done) {
            setTimeout(function () {
                expect(callback).to.have.been.calledWith("You made it!", "2");
                done();
            }, 5);
        });
    });
});
