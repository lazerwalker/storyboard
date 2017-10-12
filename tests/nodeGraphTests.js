"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var graph;
describe("completePassage", function () {
    context("when it is the last passage in the node", function () {
        it("should transition to the next node", function () {
        });
    });
    context("when it isn't the last passage", function () {
        it("should transition to the next passage", function () {
        });
    });
});
describe("checkChoiceTransitions", function () {
    context("when the node isn't complete", function () {
        it("should do nothing, even if a choice is ready", function () {
        });
    });
    context("when the node is complete", function () {
        it("should change nodes when the conditions are met", function () {
        });
        it("should not change nodes when the conditions aren't met", function () {
        });
    });
});
describe("playCurrentPassage", function () {
    it("should output with the correct passage", function () {
    });
});
