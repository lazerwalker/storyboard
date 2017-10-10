const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import { Game } from '../src/game'
import * as Actions from '../src/gameActions'
import keyPathify from '../src/keyPathify'

describe("setting variables", function() {
  context("within the graph", function() {
    let game, callback;
    beforeEach(function() {
      game = new Game({
        "graph": {
          "start": "1",
          "nodes": {
            "1": {
              "nodeId": "1",
              "passages": [
                {
                  "passageId": "1",
                  "set": {
                    "foo": "bar",
                    "baz": "graph.currentNodeId",
                    "random1": { "randInt": [0, 6] },
                    "random2": { "randInt": [0, 6] }
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

    afterEach(function() {
      keyPathify(undefined, {rngSeed: "erase"})
    })

    it("should set variable literals", function() {
      expect(game.state.foo).to.equal("bar")
    })

    it("should set keypath variables", function() {
      expect(game.state.baz).to.equal("1")
    })

    it("should set random numbers", function() {
      expect(game.state.random1).to.equal(4)
      expect(game.state.random2).to.equal(1)
    })

    context("when the passage also has content in it", function() {
      beforeEach(function() {
        game = new Game({
          "graph": {
            "start": "1",
            "nodes": {
              "1": {
                "nodeId": "1",
                "passages": [
                  {
                    "passageId": "1",
                    "type": "text",
                    "content": "Hi There!",
                    "set": {
                      "foo": "bar",
                      "baz": "graph.currentNodeId"
                    }
                  }
                ]
              }
            }
          }
        });

        callback = sinon.spy();
        game.addOutput("text", callback);

        game.start();
      })

      it("should output the content", function() {
        expect(callback).to.have.been.calledWith("Hi There!", "1")
      })

      it("should set the variable", function() {
        expect(game.state.foo).to.equal("bar")
      })
    })
  })

  context("within the bag", function() {
    let game, callback;
    beforeEach(function() {
      game = new Game({
        "bag": {
          "1": {
            "nodeId": "1",
            "passages": [
              {
                "passageId": "1",
                "set": {
                  "foo": "bar",
                  "baz": "bag.activePassageIndexes.1",
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

    afterEach(function() {
      keyPathify(undefined, {rngSeed: "erase"})
    })

    it("should set variable literals", function() {
      expect(game.state.foo).to.equal("bar")
    })

    it("should set keypath variables", function() {
      expect(game.state.baz).to.equal(0)
    })

    it("should set random numbers", function() {
      expect(game.state.random1).to.equal(4)
      expect(game.state.random2).to.equal(1)
    })
  })
});