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
    describe("waiting for completion", function() {
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
    })

    describe("when one of them should be skipped", function() {
      describe("when there are passages after the skipped one", function() {
        let first, second, game, callback;        
        beforeEach(function() {
          first = {
            "passageId": "2",
            "type": "text",
            "content": "First",
            "predicate": {foo: {exists: true}}
          } 
        })        
        context("when the appropriate passage has no predicate", function() {
          beforeEach(function() {
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
          })

          it("should go on to the next passage", function() {
            game.start();

            expect(callback).not.to.have.been.calledWith("First", "2")
            expect(callback).to.have.been.calledWith("Second", "3") 
          })
        });

        context("when the appropriate passage has a matching predicate", function() {
          beforeEach(function() {
            second = {
              "passageId": "3",
              "type": "text",
              "content": "Second",
              "predicate": {foo: {exists: false}}
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
          })

          it("should go to the next passage", function() {
            game.start();

            expect(callback).not.to.have.been.calledWith("First", "2")
            expect(callback).to.have.been.calledWith("Second", "3")
          })
        })
      })

      describe("when the skipped passage is the last one", function() {
        it("should complete the node", function() {
          const game = new Game({
            "graph": {
              "startNode": "1",
              "nodes": {
                "1": {
                  "nodeId": "1",
                  "passages": [{passageId: "2", content: "Hi!", predicate: { foo: {exists: true}}}]
                },
              }
            }
          });
          const callback = sinon.spy();
          game.addOutput("text", callback);
          game.start();

          expect(callback).not.to.have.been.calledWith("Hi!", "2");
          expect(game.state.graph.nodeComplete).to.be.true;
        })
      })
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

describe("triggering events from the bag", function() {
  context("triggered by an input change", function() {
    let node, game, output;
    beforeEach(function() {
      node = {
        nodeId: "5", 
        predicate: { "foo": { "lte": 10 }},
        passages: [
          {
            "passageId": "1",
            "type": "text",
            "content": "What do you want?"
          },
          {
            "passageId": "2",
            "type": "text",
            "content": "Well let me tell you!"
          }
        ]
      }

      game = new Game({
        "bag": {"5": node}
      });

      output = sinon.spy();
      game.addOutput("text", output);
      game.start();

      game.receiveInput("foo", 7);
    });

    it("should trigger that node", function() {
      expect(output).to.have.been.calledWith("What do you want?", "1");
    });

    it("should not trigger the second passage yet", function() {
      expect(output).not.to.have.been.calledWith("Well let me tell you!", "2");
    });

    describe("when the first passage is done", function() {
      it("should play the next passage", function() {
        game.completePassage("1");
        expect(output).to.have.been.calledWith("Well let me tell you!", "2");
      });
    });
  });

  context("triggered by a graph node being completed", function() {
    let node, game, output;
    beforeEach(function() {
      node = {
        nodeId: "5", 
        predicate: { "graph.nodeComplete": { "gte": 1 }},
        passages: [
          {
            "passageId": "1",
            "type": "text",
            "content": "Hello"
          }
        ]
      }

      game = new Game({
        bag: {"5": node},
        graph: {
          startNode: "4",
          nodes: {
            "4": {
              nodeId: "4",
              passages: [{
                passageId: "2"
              }]
            }
          }
        }
      });

      output = sinon.spy();
      game.addOutput("text", output);
      game.start();
    });

    it("should not trigger the node initially", function() {
      expect(output).not.to.have.been.calledWith("Hello", "1");
    });

    describe("when the graph node is complete", function() {
      it("should play the bag node", function() {
        game.completePassage("2");
        expect(output).to.have.been.calledWith("Hello", "1");
      });
    });
  });

  context("triggered by reaching a specific graph node", function() {
    let node, game, output;
    beforeEach(function() {
      node = {
        nodeId: "5", 
        predicate: { 
          "graph.currentNodeId": { gte: "2", lte: "2" }
        },
        passages: [
          {
            "passageId": "1",
            "type": "text",
            "content": "Hello"
          }
        ]
      }

      game = new Game({
        bag: {"5": node},
        graph: {
          startNode: "4",
          nodes: {
            "4": {
              nodeId: "4",
              passages: [{
                passageId: "2"
              }],
              choices: [{
                nodeId: "2",
                predicate: { "foo": { exists: false }}
              }]
            },
          "2": {
              nodeId: "2",
              passages: [{
                passageId: "3"
              }]
            }            
          }
        }
      });

      output = sinon.spy();
      game.addOutput("text", output);
      game.start();
    });

    it("should not trigger the node initially", function() {
      expect(output).not.to.have.been.calledWith("Hello", "1");
    });

    describe("when the target graph node hasn't been completed", function() {
      it("should trigger the bag node", function() {
        game.completePassage("2");
        expect(output).to.have.been.calledWith("Hello", "1");
      });    
    });
  });
});

describe("receiveDispatch", function() {
  // TODO: Backfill this out
  describe("MAKE_GRAPH_CHOICE",function() {
    let choice1, choice2, game;
    beforeEach(function() {
      choice1 = { nodeId: "3" }
      choice2 = { nodeId: "4" }
      game = new Game({
        graph: { 
          nodes: { 
            2: {nodeId: "2"}, 
            3: {nodeId: "3", "passages":[]}, 
            4:{ nodeId: "4", "passages":[]}
          }}})

      game.state.graph.currentNodeId = "2";
      game.receiveDispatch(Actions.MAKE_GRAPH_CHOICE, choice1);
      game.receiveDispatch(Actions.MAKE_GRAPH_CHOICE, choice2);
    });

    it("should update the previousChoice with the most recent choice", function() {
      expect(game.state.graph.previousChoice).to.eql(choice2);
    });

    it("should store the full choice history in reverse-chronological order", function() {
      expect(game.state.graph.choiceHistory).to.eql([choice2, choice1]);
    });

    it("should store the previous nodeId", function() {
      expect(game.state.graph.previousNodeId).to.equal("3");
    });

    it("should store the full node history in reverse-chronological order", function() {
      expect(game.state.graph.nodeHistory).to.eql(["3", "2"]);
    });    
  });

  describe("COMPLETE_BAG_NODE", function() {
    it("should remove the node from the list of active bag passages", function() {
      const game = new Game({});
      game.state.bag.activePassageIds["1"] = 0;

      game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");

      expect(game.state.bag.activePassageIds["1"]).to.be.undefined;
    });

    it("should trigger a sweep of new bag nodes", function() {
      const game = new Game({});
      sinon.stub(game.bag, "checkNodes");
      game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");

      expect(game.bag.checkNodes).to.have.been.calledWith(game.state);
    });

    context("when the node has never been visited before", function() {
      it("should add it to the bag node history", function() {
        const game = new Game({});
        expect(game.state.bag.nodeHistory["1"]).to.be.undefined;
        game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");
        expect(game.state.bag.nodeHistory["1"]).to.equal(1);
      })
    })

    context("when the node has been visited before", function() {
      it("should increment its node history", function() {
        const game = new Game({});
        game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");
        game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");
        expect(game.state.bag.nodeHistory["1"]).to.equal(2);
      });
    })
  });

  describe("OUTPUT", function() {
    describe("selecting outputs", function() {
      let textOutput1, textOutput2, audioOutput, game, passage;
      beforeEach(function() {
        textOutput1 = sinon.spy();
        textOutput2 = sinon.spy();
        audioOutput = sinon.spy();

        game = new Game({});
        game.addOutput("text", textOutput1);
        game.addOutput("text", textOutput2);
        game.addOutput("audio", audioOutput);

        passage = {
          "passageId": "5",
          "content": "Hello World!",
          "type": "text"
        };

        game.receiveDispatch(Actions.OUTPUT, passage)
      });
      it("should send output to all registered outputs of that type", function() {
        expect(textOutput1).to.have.been.calledWith("Hello World!", "5");
        expect(textOutput2).to.have.been.calledWith("Hello World!", "5");      
      });

      it("should only send output to outputs of the same type", function() {
        expect(audioOutput).not.to.have.been.calledWith("Hello World!", "5");
      });    
    });

    it("should evaluate all embedded variables", function() {
      const game = new Game({});
      const output = sinon.spy()

      const passage = {
        "passageId": "5",
        "content": "Hello {yourName}, it's {myName}!",
        "type": "text"
      };

      game.state.yourName = "Stanley";
      game.state.myName = "Ollie";
      game.addOutput("text", output);

      game.receiveDispatch(Actions.OUTPUT, passage);

      expect(output).to.have.been.calledWith("Hello Stanley, it's Ollie!", "5");
    });

    it("should allow nested keypaths in variables", function() {
      const game = new Game({});
      const output = sinon.spy()

      const passage = {
        "passageId": "5",
        "content": "You're in node {graph.currentNodeId}!",
        "type": "text"
      };

      game.state.graph.currentNodeId = "1";
      game.addOutput("text", output);

      game.receiveDispatch(Actions.OUTPUT, passage);

      expect(output).to.have.been.calledWith("You're in node 1!", "5");
    });
  });
});

