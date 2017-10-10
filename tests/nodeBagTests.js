const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import { Bag } from '../src/nodeBag'
import * as Actions from '../src/gameActions'

describe("filtering nodes", function() {
  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const bagData = {
        first: {nodeId: "first", predicate: { "foo": { "lte": 10 }}, track: "default"},
        second: {nodeId: "second", predicate: { "foo": { "lte": 9 }}, track: "default"},
        third: {nodeId: "third", predicate: { "foo": { "lte": 0 }}, track: "default"}
      }

      let action, data;

      function dispatch(passedAction, passedData) {
        expect(passedAction).to.equal(Actions.TRIGGERED_BAG_NODES)

        let firstNode = bag.nodes["first"]
        let secondNode = bag.nodes["second"]
        expect(passedData).to.eql({"default": [firstNode, secondNode]});
      }

      const bag = new Bag(bagData, dispatch);
      bag.checkNodes({"foo": 5});
    });
  })
});