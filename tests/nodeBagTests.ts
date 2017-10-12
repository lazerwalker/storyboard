import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'

import { Bag } from '../src/nodeBag'
import * as Actions from '../src/gameActions'
import * as Parser from 'storyboard-lang'
import { State } from '../src/state'
import { Game } from '../src/game'


chai.use(sinonChai);
const expect = chai.expect

describe("filtering nodes", function() {
  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const story = `
        ## first
          [foo <= 10]
          track: default

        ## second
          [foo <= 9]
          track: default

        ## third
          [foo <= 0]
          track: default
      `

      const game = new Game(story)
      const bag = game.story.bag
      console.log(JSON.stringify(bag.nodes, null, 3))

      let action, data;

      bag.dispatch! = (passedAction: string, passedData: any) => {
        expect(passedAction).to.equal(Actions.TRIGGERED_BAG_NODES)

        let firstNode = bag.nodes["first"]
        let secondNode = bag.nodes["second"]
        console.log(passedData)
        expect(passedData).to.eql({"default": [firstNode, secondNode]});
      }

      const state = new State()
      state.foo = "5"

      bag.checkNodes(state);
    });
  })
});