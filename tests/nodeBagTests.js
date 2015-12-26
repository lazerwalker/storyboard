const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import NodeBag from '../src/nodeBag'

describe("filtering nodes", function() {
  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const first = {nodeId: "1", predicate: { "foo": { "lte": 10 }}},
            second = {nodeId: "2", predicate: { "foo": { "lte": 9 }}},   
            third = {nodeId: "3", predicate: { "foo": { "lte": 0 }}};

      const bag = new NodeBag([first, second, third]);
        
      const result = bag.checkNodes({"foo": 5});
      expect(result).to.have.length(2);
      expect(result).to.contain(first);
      expect(result).to.contain(second);
      expect(result).not.to.contain(third);   
    });
  })
});