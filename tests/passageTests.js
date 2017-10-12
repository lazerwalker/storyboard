"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
var sinon = require("sinon");
chai.use(sinonChai);
var expect = chai.expect;
var game_1 = require("../src/game");
describe("'wait' passages", function () {
    var game, callback;
    beforeEach(function () {
        var story = "\n        # theNode\n          wait: 5\n          text: You made it!\n      ";
        game = new game_1.Game(story);
        callback = sinon.spy();
        game.addOutput("text", callback);
        game.start();
    });
    context("immediately", function () {
        it("should not play the next passage yet", function () {
            expect(callback).not.to.have.been.calledWith("You made it!", sinon.match.any);
        });
    });
    context("after enough time has passed", function () {
        it("should play the next passage", function (done) {
            setTimeout(function () {
                expect(callback).to.have.been.calledWith("You made it!", sinon.match.any);
                done();
            }, 5);
        });
    });
});
