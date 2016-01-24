const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import NodeBag from '../src/nodeBag'
import * as Actions from '../src/gameActions'

describe("filtering nodes", function() {
  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const first = {nodeId: "1", predicate: { "foo": { "lte": 10 }}, track: "default"},
            second = {nodeId: "2", predicate: { "foo": { "lte": 9 }}, track: "default"},   
            third = {nodeId: "3", predicate: { "foo": { "lte": 0 }}, track: "default"};

      const bag = new NodeBag([first, second, third]);
        
      let dispatch = sinon.spy();
      bag.dispatch = dispatch;

      const result = bag.checkNodes({"foo": 5});
      
      expect(dispatch).to.have.been.calledWith(Actions.TRIGGERED_BAG_NODES, {"default": [first, second]});
    });
  })
});