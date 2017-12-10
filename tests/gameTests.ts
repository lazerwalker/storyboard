import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Game } from '../src/game'
import * as Parser from 'storyboard-lang'
import * as Actions from '../src/gameActions'

describe("initialization", function() {
  describe("creating a nodeGraph", function() {
    var node, game: Game;
    beforeEach(function() {
      const story = `
        start: node
        # node
      `
      game = new Game(story)
    });

    it("should create a valid nodeGraph with the passed options", function() {
      expect(game.story.graph).to.exist;

      expect(game.story!.graph!.start).to.equal("node");
      expect(Object.keys(game.story!.graph!.nodes)).to.have.length(1);
    });

    it("shouldn't start the game", function() {
      expect(game.state.graph.currentNodeId).to.be.undefined;
    });
  });

  describe("creating a nodeBag", function() {
    it("should create a valid nodeBag with the passed nodes", function() {
      const story = `## node`
      const game = new Game(story)

      expect(game.story.bag).to.exist;
      expect(Object.keys(game.story.bag.nodes)).to.have.length(1)
    });
  });
});

describe("playing the node graph", function() {
  context("when starting the game", function() {
    context.skip("when there is a quoted start node", () => {
      it("should play the appropriate content via an output", function() {
        const game = new Game(`
          start: "node"

          # node
          text: "Hello World!"
        `)

        const callback = sinon.spy();
        game.addOutput("text", callback);

        game.start();
        expect(callback).to.have.been.calledWith("Hello World!", sinon.match.any);
      });
    })

    context("when there is an unquoted start node", () => {
      it("should play the appropriate content via an output", function() {
        const game = new Game(`
          start: node

          # node
          text: "Hello World!"
        `)

        const callback = sinon.spy();
        game.addOutput("text", callback);

        game.start();
        expect(callback).to.have.been.calledWith("Hello World!", sinon.match.any);
      });
    })
  });

  context("when a node has no passages", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      game = new Game(`
        start: first

        # first
        -> second: [ continue is true ]

        # second
        text: "Goodbye World!"
      `)

      callback = sinon.spy();
      game.addOutput("text", callback);
      game.start();
    });

    context("when a predicate has not yet been met", function() {
      it("should wait for the predicate to be met", function() {
        expect(callback).not.to.have.been.called
      })
    })

    context("when a predicate has been met", function() {
      it("should go immediately on", function() {
        game.receiveInput("continue", true)
        expect(callback).to.have.been.calledWith("Goodbye World!", sinon.match.any);
      });
    })
  })

  context("when there are multiple passages", function() {
    describe("waiting for completion", function() {
     let first, second, game: Game, callback: any;
      beforeEach(() => {
        game = new Game(`
          # node
          text: First
          text: Second
        `)

        callback = sinon.spy();
        game.addOutput("text", callback);

        game.start();
      });

      it("shouldn't play the second passage when the first isn't done", function() {
        expect(callback).to.have.been.calledWith("First", "0")
        expect(callback).not.to.have.been.calledWith("Second", sinon.match.any);
      });

      it("should play the second passage after the first is done", function() {
        game.completePassage("0");
        expect(callback).to.have.been.calledWith("Second", sinon.match.any);
      })
    })

    describe("when a passage has no content", function() {
      let first, second, game, callback: any;
      beforeEach(function() {
        game = new Game(`
          # node
          set foo to 5
          text: Second
        `)

        callback = sinon.spy();
        game.addOutput("text", callback);
        game.start()
      })

      it("should go on to the next passage", function() {
        expect(callback).to.have.been.calledWith("Second", sinon.match.any)
      })

      context("when it's the last one in a node", function() {
        let game, callback: any;
        beforeEach(function() {
          game = new Game(`
            # first
            set foo to 5
            -> second

            # second
            text: Second
          `)

          callback = sinon.spy();
          game.addOutput("text", callback);
          game.start()
        })

        it("should go on to the next node", function() {
          expect(callback).to.have.been.calledWith("Second", sinon.match.any)
        })
      })
    })

    describe("when one of them should be skipped", function() {
      describe("when there are passages after the skipped one", function() {
        let game: Game, callback: any;
        context("when the appropriate passage has no predicate", function() {
          beforeEach(function() {
            game = new Game(`
              # node
              [ foo is false ]
                text: First
              text: Second
            `)

            callback = sinon.spy();
            game.addOutput("text", callback);
            game.receiveInput("foo", true)
          })

          it("should go on to the next passage", function() {
            game.start();

            expect(callback).not.to.have.been.calledWith("First", sinon.match.any)
            expect(callback).to.have.been.calledWith("Second", sinon.match.any)
          })
        });

        context("when the appropriate passage has a matching predicate", function() {
          beforeEach(function() {
            game = new Game(`
              # node
              [ foo is false ]
                text: First
              [ bar is true ]
                text: Second
            `)

            callback = sinon.spy();
            game.addOutput("text", callback);
            game.receiveInput("foo", true)
            game.receiveInput("bar", true)
          })

          it("should go to the next passage", function() {
            game.start();
            expect(callback).not.to.have.been.calledWith("First", sinon.match.any)
            expect(callback).to.have.been.calledWith("Second", sinon.match.any)
          })
        })
      })

      describe("when the skipped passage is the last one", function() {
        it("should complete the node", function() {
          const game = new Game(`
            # node
            [ foo exists ]
            text: "Hi!"
          `)

          const callback = sinon.spy();
          game.addOutput("text", callback);
          game.start();

          expect(callback).not.to.have.been.calledWith("Hi!", sinon.match.any);
          expect(game.state.graph.nodeComplete).to.be.true;
        })
      })
    })
  });

  context("when making a choice using a push-button variable", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      game = new Game(`
        # start
        -> buttonPressed: [button]

        # buttonPressed
        text: Goodbye World!
      `)

      callback = sinon.spy();
      game.addOutput("text", callback);
      game.start();

      game.receiveMomentaryInput("button")
    });

    it("should trigger the appropriate nodes", function() {
      expect(callback).to.have.been.calledWith("Goodbye World!", sinon.match.any);
    });

    it("should not affect the actual variable", function() {
      expect(game.state.button).to.not.exist
    })

    context("when a value is passed in", function() {
      beforeEach(function() {
        game = new Game(`
          # start
          -> buttonPressed: [button is "pushed!"]

          # buttonPressed
          text: Goodbye World!
        `);

        callback = sinon.spy();
        game.addOutput("text", callback);
        game.start();

        game.receiveMomentaryInput("button", "pushed!")
      });

      it("should trigger the appropriate nodes", function() {
        expect(callback).to.have.been.calledWith("Goodbye World!", sinon.match.any);
      });

      it("should not affect the actual variable", function() {
        expect(game.state.button).to.not.exist
      })
    })
  });

  context("when making a choice", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      game = new Game(`
        # first
        text: foobar
        -> second: [ counter >= 10 ]

        # second
        text: Goodbye World!
      `);

      callback = sinon.spy();
      game.addOutput("text", callback);
      game.start();
    });

    describe("waiting for the node to complete", function() {
      context("when the output needs to finish first", function() {
        it("shouldn't change nodes until the content finishes", function() {
          game.receiveInput("counter", 11);
          expect(callback).not.to.have.been.calledWith("Goodbye World!", sinon.match.any);
          expect(game.state.graph.currentNodeId).to.equal("first");
        });
      });

      context("when the output has finished", function() {
        it("should play the appropriate new content", function() {
          game.completePassage("0"); // TODO: This is ugly

          game.receiveInput("counter", 11);
          expect(callback).to.have.been.calledWith("Goodbye World!", sinon.match.any);
        });
      });
    });

    describe("when the predicate has multiple conditions", function() {
      beforeEach(function() {
       game = new Game(`
          # node
          text: This doesn't matter
          -> nextNode: [ counter >= 10 and counter <= 15 ]

          # nextNode
          text: Hi
       `);

       callback = sinon.spy();
       game.addOutput("text", callback);
       game.start();
       game.completePassage("0"); // TODO
      });


      it("shouldn't transition when only one condition is met", function() {
        game.receiveInput("counter", 9);
        expect(callback).not.to.have.been.calledWith("Hi", sinon.match.any);
      });

      it("shouldn't transition when only the other condition is met", function() {
        game.receiveInput("counter", 16);
        expect(callback).not.to.have.been.calledWith("Hi", sinon.match.any);
      });

      it("should transition when both conditions are met", function() {
        game.receiveInput("counter", 12);
        expect(callback).to.have.been.calledWith("Hi", sinon.match.any);
      });
    });
  });

  context("when a choice is triggered by an in-passage variable set", function() {
    let game: Game, callback: any;
    beforeEach(function() {
      game = new Game(`
        # first
        text: Hi!
        set foo to 1
        -> second: [ foo is 1 ]

        # second
        text: Goodbye World!
      `);

      callback = sinon.spy();
      game.addOutput("text", callback);

      game.start();
    });

    it("shouldn't change until the passage has ended", function() {
      expect(callback).not.to.have.been.calledWith("Goodbye World!", sinon.match.any);
      expect(game.state.graph.currentNodeId).to.equal("first");
    })
    it("should change after the passage has ended", function() {
      game.completePassage("0"); // TODO
      expect(callback).to.have.been.calledWith("Goodbye World!", sinon.match.any);
      expect(game.state.graph.currentNodeId).to.equal("second");
    });
  })
});

describe("triggering events from the bag", function() {
  context("when the game hasn't started yet", function() {
    let node, game, output: any;
    beforeEach(function() {
      game = new Game(`
        ## node
        [ foo <= 10 ]
        text: What do you want?
        text: Well let me tell you!
      `);

      output = sinon.spy();
      game.addOutput("text", output);

      game.receiveInput("foo", 7);
    });

    it("shouldn't do anything", function() {
      expect(output).not.to.have.been.calledOnce;
    });
  })

  describe("different ways to trigger an event", function() {
    context("when the game starts without a start", function() {
      let game, output: any;

      beforeEach(function() {
        game = new Game(`
          ## node
          text: First
        `);

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should play a valid event node", function() {
        expect(output).to.have.been.calledWith("First", sinon.match.any)
      })
    });

    context("triggered by an input change", function() {
      let game: Game, output: any;
      beforeEach(function() {
        game = new Game(`
          ## node
          [ foo <= 10 ]
          text: What do you want?
          text: Well let me tell you!
        `);

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();

        game.receiveInput("foo", 7);
      });

      it("should trigger that node", function() {
        expect(output).to.have.been.calledWith("What do you want?", sinon.match.any);
      });

      it("should not trigger the second passage yet", function() {
        expect(output).not.to.have.been.calledWith("Well let me tell you!", sinon.match.any);
      });

      describe("when the first passage is done", function() {
        it("should play the next passage", function() {
          game.completePassage("0");
          expect(output).to.have.been.calledWith("Well let me tell you!", sinon.match.any);
        });
      });
    });

    context("triggered by a push-button input", function() {
      let game: Game, output: any;
      beforeEach(function() {
        game = new Game(`
          ## node
          [ button ]
          text: What do you want?
        `);

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();

        game.receiveMomentaryInput("button")
      });

      it("should trigger that node", function() {
        expect(output).to.have.been.calledWith("What do you want?", sinon.match.any);
      });

      it("should not change the global state", function() {
        expect(game.state.button).to.not.exist
      });
    })

    context("triggered by a graph node being completed", function() {
      let node, game: Game, output: any;
      beforeEach(function() {
        game = new Game(`
          # graphNode
          text: foobar

          ## bagNode
          [ graph.nodeComplete ]
          text: Hello
        `)

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should not trigger the node initially", function() {
        expect(output).not.to.have.been.calledWith("Hello", sinon.match.any);
      });

      describe("when the graph node is complete", function() {
        it("should play the bag node", function() {
          game.completePassage("1"); // TODO, lol I don't know why this is 1 instead of 0
          expect(output).to.have.been.calledWith("Hello", sinon.match.any);
        });
      });
    });

    context("triggered by reaching a specific graph node", function() {
      let node, game: Game, output: any;
      beforeEach(function() {
        game = new Game(`
          # firstGraphNode
          text: foo
          -> secondGraphNode

          # secondGraphNode
          text: bar

          ## bagNode
          [ graph.currentNodeId is "secondGraphNode" ]
          text: Hello
        `)


        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should not trigger the node initially", function() {
        expect(output).not.to.have.been.calledWith("Hello", sinon.match.any);
      });

      describe("when the target graph node has been completed", function() {
        it("should trigger the bag node", function() {
          game.completePassage("1"); // TODO
          expect(output).to.have.been.calledWith("Hello", sinon.match.any);
        });
      });
    });
  });

  describe("triggering the same node multiple times", function() {
    context("when the node should only trigger once", function() {
      let game: Game, output: any;
      beforeEach(function() {
        game = new Game(`
          ## node
          [ foo <= 10 ]
          text: Something
        `)

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      })

      it("shouldn't play a second time while it's still playing the first time", function() {
        game.receiveInput("foo", 7);
        game.receiveInput("foo", 7);

        expect(output).to.have.been.calledOnce;
      })

      it("shouldn't play even after the first time has completed", function() {
        game.receiveInput("foo", 7);
        game.completePassage("0");
        game.receiveInput("foo", 7);

        expect(output).to.have.been.calledOnce;
      })
    });

    context("when the node should trigger multiple times", function() {
      let game: Game, node, output: any;
      beforeEach(function() {
        game = new Game(`
          ## node
          [ foo <= 10 ]
          text: Something
          allowRepeats
        `)

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      })

      it("shouldn't play a second time while it's still playing the first time", function() {
        game.receiveInput("foo", 7);
        game.receiveInput("foo", 7);

        expect(output).to.have.been.calledOnce;
      })

      it("should allow playing a second time", function() {
        game.receiveInput("foo", 7);
        game.completePassage("0");
        game.receiveInput("foo", 7);

        expect(output).to.have.been.calledTwice;
      })
    });
  });

  context("when there are multiple valid nodes", function() {
    context("when they both belong to the default track", function() {
      let game, output: any;

      beforeEach(function() {
        game = new Game(`
          ## first
          text: First

          ## second
          text: Second
        `)

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should only play one of them at once", function() {
        expect(output).to.have.been.calledOnce;
      })
    });

    context("when they belong to the same track", function() {
      let game: Game,  output: any;
      beforeEach(function() {
          game = new Game(`
          ## first
          track: primary
          text: First

          ## second
          track: primary
          text: Second
        `)


        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should only play one of them at once", function() {
        expect(output).to.have.been.calledOnce;
      })
    });

    context("when they belong to different tracks", function() {
      let game, node1, node2, output: any;
      beforeEach(function() {
        game = new Game(`
          ## first
          track: primary
          text: Primary Track!

          ## second
          track: secondary
          text: Secondary Track!
        `)

        output = sinon.spy();
        game.addOutput("text", output);
        game.start();
      });

      it("should play both of them", function() {
        expect(output).to.have.been.calledTwice;
        expect(output).to.have.been.calledWith("Primary Track!", sinon.match.any);
        expect(output).to.have.been.calledWith("Secondary Track!", sinon.match.any);
      })
    });
  })
});

describe("receiving input", function() {
  context("when the input variable is a keypath", function() {
    context("when the keypath exists", function() {
      let game: Game;
      beforeEach(function() {
        game = new Game({})
        game.state.foo = {}
        game.receiveInput("foo.bar", "baz")
      })

      it("should create the appropriate state", function() {
        expect(game.state.foo.bar).to.equal("baz")
      })

      it("should not create the wrong variable", function() {
        expect(game.state["foo.bar"]).to.not.exist
      })
    })

    // TODO: This behavior should eventually match the previous test case
    context("when the keypath doesn't exist", function() {
      let game: Game;
      beforeEach(function() {
        game = new Game({})
        game.receiveInput("foo.bar", "baz")
      })

      it("should create nested state", function() {
        expect(game.state.foo.bar).to.equal("baz")
      })

      it("should not create the wrong variable", function() {
        expect(game.state["foo.bar"]).to.not.exist
      })
    })
  })

  context("when the input data is an object", function() {
    it("should set the object", function() {
      let game = new Game({});
      game.receiveInput("foo", {"bar": "baz"})
      expect(game.state.foo.bar).to.equal("baz")
    })
  })
})

describe("observing variables", function() {
  let game: Game, output: any;

  context("when the thing being observed is just a variable", () => {
    context("changing the variable via input", () => {
      beforeEach(function() {
        game = new Game(`
          ## node
          text: Don't you watch!
        `);

        output = sinon.spy();

        game.addObserver("pot", output);
        game.start()
        game.receiveInput("pot", "boiled");
      });

      it("should trigger when the value changes", () => {
        expect(output).to.have.been.calledWith("boiled")
      })
    })

    context("changing the variable within the story", () => {
      beforeEach(function() {
        game = new Game(`
          ## node
          set pot to "boiled"
        `);

        output = sinon.spy();

        game.addObserver("pot", output);
        game.start()
      });

      it("should trigger when the value changes", () => {
        expect(output).to.have.been.calledWith("boiled")
      })
    })
  })

  context("when the thing being observed is a nested property", () => {
    context("changing the value via input", () => {
      beforeEach(function() {
        game = new Game(`
          ## node
          text: Don't you watch!
        `);

        output = sinon.spy();

        game.addObserver("pot.waterTemp", output);
        game.start()
        game.receiveInput("pot.waterTemp", "boiled");
      });

      it("should trigger when the value changes", () => {
        expect(output).to.have.been.calledWith("boiled")
      })

      it("should trigger on subsequent changes", () => {
        game.receiveInput("pot.waterTemp", "unboiled")
        expect(output).to.have.been.calledWith("unboiled")
      })

      it("should trigger when undefined", () => {
        game.receiveInput("pot.waterTemp", undefined)
        expect(output).to.have.been.calledWith(undefined)
      })

      context("when there are multiple observers", () => {
        let output2 = sinon.spy()
        beforeEach(() => {
          game.addObserver("pot.waterLevel", output)
          game.addObserver("pot.waterLevel", output2)
        })

        it("should trigger both", () => {
          game.receiveInput("pot.waterLevel", "3 quarts")

          expect(output).to.have.been.calledWith("3 quarts")
          expect(output2).to.have.been.calledWith("3 quarts")
        })

        context("when one is unobserved", () => {
          it("should only call the right one", () => {
            game.removeObserver("pot.waterLevel", output)
            game.receiveInput("pot.waterLevel", "3 quarts")

            expect(output).to.not.have.been.calledWith("3 quarts")
            expect(output2).to.have.been.calledWith("3 quarts")
          })
        })
      })

      it("should not trigger after unobserving", () => {
        game.removeObserver("pot.waterTemp", output)
        game.receiveInput("pot.waterTemp", "unboiled")
        expect(output).to.not.have.been.calledWith("unboiled")
      })
    })

    context("changing the value within the story", () => {
      beforeEach(function() {
        game = new Game(`
          ## node
          set pot.waterTemp to "boiled"
        `);

        output = sinon.spy();

        game.addObserver("pot.waterTemp", output);
        game.start()
      });

      it("should trigger when the value changes", () => {
        expect(output).to.have.been.calledWith("boiled")
      })

      it("should trigger on subsequent changes", () => {
        game = new Game(`
          ## node
          set pot.waterTemp to "boiled"
          set pot.waterTemp to "unboiled"
        `);

        output = sinon.spy();

        game.addObserver("pot.waterTemp", output);
        game.start()

        expect(output).to.have.been.calledWith("boiled")
        expect(output).to.have.been.calledWith("unboiled")
      })
    })
  })

  // TODO
  context.skip("when the thing being observed is a system variable", () => {
    beforeEach(function() {
      game = new Game(`
        ## node
        set pot.waterTemp to "boiled"
      `);

      output = sinon.spy();

      game.addObserver("graph.currentNodeId", output);
      game.start()
    });

    it("should trigger when the value changes", () => {
      expect(output).to.have.been.calledWith("node")
    })
  })
})

// TODO: Find somewhere else for these to live?
describe("receiveDispatch", function() {
  // TODO: Backfill this out
  describe("MAKE_GRAPH_CHOICE",function() {
    let choice1: Parser.Choice, choice2: Parser.Choice, game: Game;
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

  // TODO:
  // COMPLETE_BAG_NODE now relies on more of the state graph than is being exposed in this tiny harness.
  // I could hack it to work now, but I need to think more about the value and structure of these unit-level tests in general
  describe.skip("COMPLETE_BAG_NODE", function() {
    it("should remove the node from the list of active bag passages", function() {
      const game = new Game({});
      game.state.bag.activePassageIndexes["1"] = 0;
      game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");

      expect(game.state.bag.activePassageIndexes["1"]).to.be.undefined;
    });

    it("should trigger a sweep of new bag nodes", function() {
      // TODO: I'm not sure this is a valuable test!
      const game = new Game({});
      sinon.stub(game.story.bag, "checkNodes");
      game.receiveDispatch(Actions.COMPLETE_BAG_NODE, "1");

      expect(game.story.bag.checkNodes).to.have.been.calledWith(game.state);
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
      let textOutput1: any, textOutput2: any, audioOutput: any, game, passage;
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
        expect(textOutput1).to.have.been.calledWith("Hello World!", sinon.match.any);
        expect(textOutput2).to.have.been.calledWith("Hello World!", sinon.match.any);
      });

      it("should only send output to outputs of the same type", function() {
        expect(audioOutput).not.to.have.been.calledWith("Hello World!", sinon.match.any);
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

      expect(output).to.have.been.calledWith("Hello Stanley, it's Ollie!", sinon.match.any);
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

      expect(output).to.have.been.calledWith("You're in node 1!", sinon.match.any);
    });
  });
});

