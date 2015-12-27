const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import Game from '../src/game'
import * as Actions from '../src/gameActions'

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
      expect(game.state.graph.currentNodeId).to.be.undefined;
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

describe("playing the node graph", function() {
  context("when starting the game", function() {
    it("should play the appropriate content via an output", function() {
      const game = new Game({
        "graph": {
          "startNode": "1",
          "nodes": {
            "1": {
              "nodeId": "1",
              "passages": [
                {
                  "passageId": "5",
                  "type": "text",
                  "content": "Hello World!"
                }
              ]
            } 
          }
        }
      });

      const callback = sinon.spy();
      game.addOutput("text", callback);

      game.start();

      expect(callback).to.have.been.calledWith("Hello World!", "5");
    });
  });

  context("when there are multiple passages", function() {
    let first, second, game, callback;
    beforeEach(function() {
      first = {
        "passageId": "2",
        "type": "text",
        "content": "First"
      } 

      second = {
        "passageId": "3",
        "type": "text",
        "content": "Second"
      }

      game = new Game({
        "graph": {
          "startNode": "1",
          "nodes": {
            "1": {
              "nodeId": "1",
              "passages": [first, second]
            },
          }
        }
      });

      callback = sinon.spy();
      game.addOutput("text", callback);

      game.start();
    });

    it("shouldn't play the second passage when the first isn't done", function() {
      expect(callback).to.have.been.calledWith("First", "2")
      expect(callback).not.to.have.been.calledWith("Second", "3");
    });

    it("should play the second passage after the first is done", function() {
      game.completePassage("2");
      expect(callback).to.have.been.calledWith("Second", "3");
    })
  });

  context("when making a choice", function() {
    let game, callback;
    beforeEach(function() {
      game = new Game({
        "graph": {
          "startNode": "1",
          "nodes": {
            "1": {
              "nodeId": "1",
              "passages": [
                {
                  "passageId": "5",
                }
              ],
              "choices": [
                {
                  "nodeId": "2",
                  "predicate": {
                    "counter": { "gte": 10 }
                  }
                }   
              ]
            },
            "2": {
              "nodeId": "2",
              "passages": [
                {
                  "passageId": "6",
                  "type": "text",
                  "content": "Goodbye World!"
                }
              ]
            } 
          }
        }
      });

      callback = sinon.spy();
      game.addOutput("text", callback);
      game.start();
    });

    describe("waiting for the node to complete", function() {
      context("when the output needs to finish first", function() {
        it("shouldn't change nodes until the content finishes", function() {
          game.receiveInput("counter", 11);
          expect(callback).not.to.have.been.calledWith("Goodbye World!", "6");
          expect(game.state.graph.currentNodeId).to.equal("1");
        });
      });

      context("when the output has finished", function() {
        it("should play the appropriate new content", function() {
          game.completePassage("5");

          game.receiveInput("counter", 11);
          expect(callback).to.have.been.calledWith("Goodbye World!", "6");
        });
      });
    });

    describe("when the predicate has multiple conditions", function() {
      beforeEach(function() {
       game = new Game({
          "graph": {
            "startNode": "1",
            "nodes": {
              "1": {
                "nodeId": "1",
                "passages": [
                  {
                    "passageId": "5",
                  }
                ],
                "choices": [
                  {
                    "nodeId": "2",
                    "predicate": {
                      "counter": { "gte": 10, "lte": 15 }
                    }
                  }   
                ]
              },
              "2": {
                "nodeId": "2",
                "passages": [{ 
                  "passageId": "1",
                  "content": "Hi",
                  "type": "text"
                }]
              } 
            }
          }
        });
       callback = sinon.spy();
       game.addOutput("text", callback);
       game.start();
       game.completePassage("5");
      });
 

      it("shouldn't transition when only one condition is met", function() {
        game.receiveInput("counter", 9);
        expect(callback).not.to.have.been.calledWith("Hi", "1");
      });

      it("shouldn't transition when only the other condition is met", function() {
        game.receiveInput("counter", 16);
        expect(callback).not.to.have.been.calledWith("Hi", "1");
      });

      it("should transition when both conditions are met", function() {
        game.receiveInput("counter", 12);
        expect(callback).to.have.been.calledWith("Hi", "1");
      });
    });
  });  
});