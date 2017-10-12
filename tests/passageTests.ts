import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import { spy } from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Game } from '../src/game'
import * as Actions from '../src/gameActions'
import keyPathify from '../src/keyPathify'

describe("'wait' passages", function() {
  let game, callback: any;
    beforeEach(function() {
      game = new Game({
        "graph": {
          "start": "theNode",
          "nodes": {
            "theNode": {
              "nodeId": "theNode",
              "passages": [
                {
                  "passageId": "1",
                  "type": "wait",
                  "content": "5"
                },
                {
                  "passageId": "2",
                  "type": "text",
                  "content": "You made it!"
                }
              ]
            }
          }
        }
      });

      callback = spy();
      game.addOutput("text", callback);

      game.start();
  });

  context("immediately", function() {
    it("should not play the next passage yet", function () {
      expect(callback).not.to.have.been.calledWith("You made it!", "2")
    })
  })

  context("after enough time has passed", function () {
    it("should play the next passage", function(done) {
        setTimeout(function() {
          expect(callback).to.have.been.calledWith("You made it!", "2");
          done();
        }, 5);
    });
  });


});