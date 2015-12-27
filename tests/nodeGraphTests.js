const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import Graph from '../src/nodeGraph'
import * as Actions from '../src/gameActions'

var graph;

describe("completePassage", function() {
  context("when it is the last passage in the node", function() {
    it("should transition to the next node", function() {

    });
  });

  context("when it isn't the last passage", function() {
    it("should transition to the next passage", function() {

    });
  });
});

describe("checkChoiceTransitions", function() {
  context("when the node isn't complete", function() {
    it("should do nothing, even if a choice is ready", function() {

    });
  });

  context("when the node is complete", function() {
    it("should change nodes when the conditions are met", function() {

    });

    it("should not change nodes when the conditions aren't met", function() {

    });
  });
});

describe("playCurrentPassage", function() {
  it("should output with the correct passage", function() {

  });
});