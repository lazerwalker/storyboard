import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import { Game } from '../src/game'
import * as Actions from '../src/gameActions'
import keyPathify from '../src/keyPathify'

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
      expect(callback).not.to.have.been.calledWith("You made it!", sinon.match.any)
    })
  })

  context("after enough time has passed", function () {
    it("should play the next passage", function(done) {
        setTimeout(function() {
          expect(callback).to.have.been.calledWith("You made it!", sinon.match.any);
          done();
        }, 5);
    });
  });


});