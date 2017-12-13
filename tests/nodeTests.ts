import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Game } from '../src/game'
import { State } from '../src/state'
import * as Actions from '../src/gameActions'
import keyPathify from '../src/keyPathify'

describe("setting variables", function() {
  context("within the graph", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      const story = `
        # node
          set foo to bar
          set baz to graph.currentNodeId
          set a.b to "c"
      `
      game = new Game(story)

      callback = sinon.spy();
      game.addOutput("text", callback);

      game.state.rngSeed = "knownSeed"
      game.start();
    })

    afterEach(function() {
      const state = new State()
      state.rngSeed = "erase"
      keyPathify(undefined, state)
    })

    it("should set variable literals", function() {
      expect(game.state.foo).to.equal("bar")
    })

    it("should evaluate values that are keypaths", function() {
      expect(game.state.baz).to.equal("node")
    })

    it("should evaluate keys that are keypaths", () => {
      expect(game.state.a.b).to.equal("c")
    })

    context("functionality not yet in the lang", () => {
      beforeEach(function() {
        game = new Game({
          "graph": {
            "start": "node",
            "nodes": {
              "node": {
                "nodeId": "node",
                "passages": [
                  {
                    "passageId": "1",
                    "set": {
                      "random1": { randInt: [0, 6] },
                      "random2": { randInt: [0, 6] }
                    }
                  }
                ]
              }
            }
          }
        });

        callback = sinon.spy();
        game.addOutput("text", callback);

        game.state.rngSeed = "knownSeed"
        game.start();
      })

      it("should set random numbers", function() {
        expect(game.state.random1).to.equal(4)
        expect(game.state.random2).to.equal(1)
      })
    })

    context("when the passage also has content in it", function() {
      beforeEach(function() {
        const story = `
          # node
            set foo to bar
            set baz to graph.currentNodeId
            text: Hi there!
        `

        game = new Game(story)
        console.log(JSON.stringify(game.story, null, 3))
        callback = sinon.spy();
        game.addOutput("text", callback);

        game.start();
      })

      it("should output the content", function() {
        expect(callback).to.have.been.calledWith("Hi there!", sinon.match.any, "default")
      })

      it("should set the variable", function() {
        expect(game.state.foo).to.equal("bar")
      })

      it("should set keypath variables", function() {
        expect(game.state.baz).to.equal("node")
      })
    })
  })

  context("within the bag", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      const story = `
        ## node
          set foo to bar
          set baz to bag.activePassageIndexes.node
          text: Hi there!
      `
      game = new Game(story)

      const callback = sinon.spy();
      game.addOutput("text", callback);

      game.state.rngSeed = "knownSeed"
      game.start();
    })

    afterEach(function() {
      const state = new State()
      state.rngSeed = "erase"
      keyPathify(undefined, state)
    })

    it("should set variable literals", function() {
      expect(game.state.foo).to.equal("bar")
    })

    it("should set keypath variables", function() {
      expect(game.state.baz).to.equal(1)
    })

    context("functionality not yet in the lang", () => {
      beforeEach(function() {
        game = new Game({
          "bag": {
            "node": {
              "nodeId": "node",
              "passages": [
                {
                  "passageId": "1",
                  "set": {
                    "foo": "bar",
                    "baz": "bag.activePassageIndexes.node",
                    "random1": { "randInt": [0, 6] },
                    "random2": { "randInt": [0, 6] }
                  }
                }
              ]
            }
          }
        });

        const callback = sinon.spy();
        game.addOutput("text", callback);

        game.state.rngSeed = "knownSeed"
        game.start();
      })

      it("should set random numbers", function() {
        expect(game.state.random1).to.equal(4)
        expect(game.state.random2).to.equal(1)
      })
    })
  })
});