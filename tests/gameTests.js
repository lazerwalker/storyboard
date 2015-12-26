const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import Game from '../src/game'

describe("initialization", function() {
  describe("creating a nodeGraph", function() {
    var node, game;
    beforeEach(function() {
      node = { "nodeId": "1" };
      game = new Game({
        "graph": {
          "startNode": "1",
          "nodes": {
            "1": node
          }
        }
      });
    });

    it("should create a valid nodeGraph with the passed options", function() {
      expect(game.graph).to.exist;

      // TODO: is this too implementation-specific?
      expect(game.graph.startNode).to.equal("1");
      expect(game.graph.nodes).to.eql({"1": node});
    });

    it("shouldn't start the game", function() {
      expect(game.graph.currentNode).to.be.undefined;
    });
  });


  it("should create a valid nodeGraph with the passed options", function() {
    const node = { "nodeId": "1" };
    const game = new Game({
      "graph": {
        "startNode": "1",
        "nodes": {
          "1": node
        }
      }
    });

    expect(game.graph).to.exist;
    expect(game.graph.startNode).to.equal("1");
    expect(game.graph.nodes).to.eql({"1": node});
  });

  describe("creating a nodeBag", function() {
    it("should create a valid nodeBag with the passed nodes", function() {
      const node = {"nodeId": "5"}
      const game = new Game({bag: [node]});

      expect(game.bag).to.exist;
      expect(game.bag.nodes).to.eql([node]);
    });
  });
});