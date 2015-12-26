const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import checkPredicate from '../src/predicate'

describe("predicate types", function() {
  describe("lte", function() {
    let predicate;

    beforeEach(function() {
      predicate = {"foo": {"lte": 5}}
    });

    it("should not fire for values greater than", function() {
      const result = checkPredicate(predicate, {"foo": 10});
      expect(result).to.be.false;
    });

    it("should fire for values less than", function() {
      const result = checkPredicate(predicate, {"foo": 4});
      expect(result).to.be.true;
    });

    it("should fire for values equal to", function() {
      const result = checkPredicate(predicate, {"foo": 5});
      expect(result).to.be.true;
    });
  });

  describe("gte", function() {
    let predicate;
    
    beforeEach(function() {
      predicate = {"foo": {"gte": 5}}
    });

    it("should not fire for values less than", function() {
      const result = checkPredicate(predicate, {"foo": 4});
      expect(result).to.be.false;
    });

    it("should fire for values greater than", function() {
      const result = checkPredicate(predicate, {"foo": 6});
      expect(result).to.be.true;
    });

    it("should fire for values equal to", function() {
      const result = checkPredicate(predicate, {"foo": 5});
      expect(result).to.be.true;
    });
  });

  describe("exists", function() {
    describe("when asserting an object should exist", function() {
      let predicate;
      beforeEach(function() {
        predicate = {"foo": {"exists": true}};
      });

      it("should return true if the object exists", function() {
        const result = checkPredicate(predicate, {"foo": 5})
        expect(result).to.be.true;
      });

      it("should return false if the object is undefined", function() {
        const result = checkPredicate(predicate, {"foo": undefined})
        expect(result).to.be.false;

      });

      it("should return false if the object key doesn't exist", function() {
        const result = checkPredicate(predicate, {})
        expect(result).to.be.false;
      });
    });

    describe("when asserting an object shouldn't exist", function() {
      let predicate;
      beforeEach(function() {
        predicate = {"foo": {"exists": false}};
      });

      it("should return false if the object exists", function() {
        const result = checkPredicate(predicate, {"foo": 5})
        expect(result).to.be.false;
      });

      it("should return true if the object is undefined", function() {
        const result = checkPredicate(predicate, {"foo": undefined})
        expect(result).to.be.true;

      });

      it("should return true if the object key doesn't exist", function() {
        const result = checkPredicate(predicate, {})
        expect(result).to.be.true;
      });
    });    
  });
});

describe("combining multiple conditions", function() {
  let predicate;

  beforeEach(function() {
    predicate = {"foo": {"lte": 10, "gte": 5}}
  });

  it("should return true when both are true", function() {
    const result = checkPredicate(predicate, {"foo": 7});
    expect(result).to.be.true;
  });

  it("should not return true when only one is true", function() {
    const result1 = checkPredicate(predicate, {"foo": 4});
    expect(result1).to.be.false;

    const result2 = checkPredicate(predicate, {"foo": 11});
    expect(result2).to.be.false;
  });
});