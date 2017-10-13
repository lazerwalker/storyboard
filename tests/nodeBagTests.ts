import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

chai.use(sinonChai);
const expect = chai.expect

import { Bag } from '../src/nodeBag'
import * as Actions from '../src/gameActions'
import * as Parser from 'storyboard-lang'
import { State } from '../src/state'

describe("filtering nodes", function() {
  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const bagData: Parser.NodeBag = {
        first: {nodeId: "first", predicate: { "foo": { "lte": 10 }}, track: "default"},
        second: {nodeId: "second", predicate: { "foo": { "lte": 9 }}, track: "default"},
        third: {nodeId: "third", predicate: { "foo": { "lte": 0 }}, track: "default"}
      }

      let action, data;

      function dispatch(passedAction: string, passedData: any) {
        expect(passedAction).to.equal(Actions.TRIGGERED_BAG_NODES)

        let firstNode = bag.nodes["first"]
        let secondNode = bag.nodes["second"]
        expect(passedData).to.eql({"default": [firstNode, secondNode]});
      }

      const bag = new Bag(bagData, dispatch);
      const state = new State()
      state.foo = "5"

      bag.checkNodes(state);
    });
  })
});