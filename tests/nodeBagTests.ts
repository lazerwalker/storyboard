import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Bag } from '../src/nodeBag'
import * as Actions from '../src/gameActions'
import { State } from '../src/state'

import * as Parser from 'storyboard-lang'

describe("filtering nodes", function() {
  context("when a track is already active", () => {
    it("should ignore just that track", () => {
      const story = Parser.parseString(`
        ## first
        [ foo < 9 ]
        text: Hi

        ## second
        [ foo <= 10 ]
        text: Hello

        ## third
        [ foo  < 100 ]
        track: otherTrack
        text: La dee dah, off in my own world
      `) as Parser.Story

      const dispatch = sinon.spy()
      const bag = new Bag(story.bag!, dispatch)

      const state = new State()
      state.bag.activeTracks.default = true

      bag.checkNodes(state);

      expect(dispatch).to.have.been.calledWith(Actions.TRIGGERED_BAG_NODES, {"otherTrack": bag.nodes.third})
    })
  })

  context("when some nodes match the predicate but others don't", function() {
    it("should only return the nodes that match", function() {
      const story = Parser.parseString(`
        ## first
        [ foo < 9 ]
        text: first

        ## second
        [ foo <= 0 ]
        text: second
      `) as Parser.Story

      const dispatch = sinon.spy()

      const bag = new Bag(story.bag, dispatch);
      const state = new State()
      state.foo = "5"

      bag.checkNodes(state);

      expect(dispatch).to.have.been.calledWith(Actions.TRIGGERED_BAG_NODES, {"default": bag.nodes.first})
    })
  });
});