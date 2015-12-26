const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;

chai.use(sinonChai);

import checkPredicate from '../src/predicate'

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