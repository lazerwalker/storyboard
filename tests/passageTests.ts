import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Game } from '../src/game'

describe("'wait' passages", function() {
  let game, callback: any;
    beforeEach(function() {
      const story = `
        # theNode
          wait: 5
          text: You made it!
      `
      game = new Game(story)

      callback = sinon.spy();
      game.addOutput("text", callback);

      game.start();
  });

  context("immediately", function() {
    it("should not play the next passage yet", function () {
      expect(callback).not.to.have.been.calledWith("You made it!", sinon.match.any, "default")
    })
  })

  context("after enough time has passed", function () {
    it("should play the next passage", function(done) {
        setTimeout(function() {
          expect(callback).to.have.been.calledWith("You made it!", sinon.match.any, "default");
          done();
        }, 5);
    });
  });
});

// TODO: It is bonkers this logic is reimplemented in both the bag and graph
describe("passages with predicates", () => {
  context("graph", () => { 
    let game: Game, callback: any;
    beforeEach(function() {
      const story = `
        # theNode
          set sawDefault to true
          [unless sawDefault]
            set sawFalseNode to true
          [sawDefault]
            set sawTrueNode to true
      `
      game = new Game(story)
      console.log(JSON.stringify(game.story.graph, null, 2))
      game.start();
    });

    it("should play normal predicate-less nodes", () => {
      expect(game.state.sawDefault).to.equal(true)
    })

    it("should play true predicates", function () {
      expect(game.state.sawTrueNode).to.equal(true)
    })

    it("should skip false predicates", function () {
      expect(game.state.sawFalseNode).to.not.exist
    })

    // TODO: unimplemented functionality!
    it.skip("should allow checking raw values instead of state", () => {
      const story = `
        # theNode
          set sawDefault to true
          [false]
            set sawFalseNode to true
          [true]
            set sawTrueNode to true
      `
      game = new Game(story)
      console.log(JSON.stringify(game.story.graph, null, 2))
      game.start(); 

      expect(game.state.sawDefault).to.equal(true)
      expect(game.state.sawTrueNode).to.equal(true) 
      expect(game.state.sawFalseNode).to.equal(false)
    })
  })

  context("bag", () => { 
    let game: Game, callback: any;
    beforeEach(function() {
      const story = `
        ## theNode
        [unless somethingFalse exists]
          set sawDefault to true
          [unless sawDefault]
            set sawFalseNode to true
          [sawDefault]
            set sawTrueNode to true
      `
      game = new Game(story)
      console.log(JSON.stringify(game.story.graph, null, 2))
      game.start();
    });

    it("should play normal predicate-less nodes", () => {
      expect(game.state.sawDefault).to.equal(true)
    })

    it("should play true predicates", function () {
      expect(game.state.sawTrueNode).to.equal(true)
    })

    it("should skip false predicates", function () {
      expect(game.state.sawFalseNode).to.not.exist
    })

    // TODO: unimplemented functionality!
    it.skip("should allow checking raw values instead of state", () => {
      const story = `
        ## theNode
          set sawDefault to true
          [false]
            set sawFalseNode to true
          [true]
            set sawTrueNode to true
      `
      game = new Game(story)
      console.log(JSON.stringify(game.story.graph, null, 2))
      game.start(); 

      expect(game.state.sawDefault).to.equal(true)
      expect(game.state.sawTrueNode).to.equal(true) 
      expect(game.state.sawFalseNode).to.equal(false)
    })
  })
})