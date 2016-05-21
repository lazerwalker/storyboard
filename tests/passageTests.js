const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import Game from '../src/game'
import * as Actions from '../src/gameActions'
import keyPathify from '../src/keyPathify'

describe("'wait' passages", function() {
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

      callback = sinon.spy();
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