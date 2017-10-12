"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var predicate_1 = require("../src/predicate");
var keyPathify_1 = require("../src/keyPathify");
describe("predicates", function () {
    var predicate;
    describe("predicate types", function () {
        describe("lte", function () {
            beforeEach(function () {
                predicate = { "foo": { "lte": 5 } };
            });
            it("should not fire for values greater than", function () {
                var result = predicate_1.default(predicate, { "foo": 10 });
                expect(result).to.be.false;
            });
            it("should fire for values less than", function () {
                var result = predicate_1.default(predicate, { "foo": 4 });
                expect(result).to.be.true;
            });
            it("should fire for values equal to", function () {
                var result = predicate_1.default(predicate, { "foo": 5 });
                expect(result).to.be.true;
            });
        });
        describe("gte", function () {
            beforeEach(function () {
                predicate = { "foo": { "gte": 5 } };
            });
            it("should not fire for values less than", function () {
                var result = predicate_1.default(predicate, { "foo": 4 });
                expect(result).to.be.false;
            });
            it("should fire for values greater than", function () {
                var result = predicate_1.default(predicate, { "foo": 6 });
                expect(result).to.be.true;
            });
            it("should fire for values equal to", function () {
                var result = predicate_1.default(predicate, { "foo": 5 });
                expect(result).to.be.true;
            });
        });
        describe("eq", function () {
            beforeEach(function () {
                predicate = { "foo": { "eq": 5 } };
            });
            context("numbers", function () {
                it("should fire for equal values", function () {
                    var result = predicate_1.default(predicate, { "foo": 5 });
                    expect(result).to.be.true;
                });
                it("should not fire for greater values", function () {
                    var result = predicate_1.default(predicate, { "foo": 6 });
                    expect(result).to.be.false;
                });
                it("should not fire for lesser values", function () {
                    var result = predicate_1.default(predicate, { "foo": 4 });
                    expect(result).to.be.false;
                });
            });
            context("strings", function () {
                it("should return true when two strings are equal", function () {
                    var predicate = { "foo": { "eq": "bar" } };
                    var result = predicate_1.default(predicate, { foo: "bar" });
                    expect(result).to.be.true;
                });
                it("should return false when two strings are not equal", function () {
                    var predicate = { "foo": { "eq": "bar" } };
                    var result = predicate_1.default(predicate, { foo: "baz" });
                    expect(result).to.be.false;
                });
                it("should return false when the input value is a substring", function () {
                    var predicate = { "foo": { "eq": "ba" } };
                    var result = predicate_1.default(predicate, { foo: "bar" });
                    expect(result).to.be.false;
                });
                it("should return false when the state value is a subtring", function () {
                    var predicate = { "foo": { "eq": "bar" } };
                    var result = predicate_1.default(predicate, { foo: "ba" });
                    expect(result).to.be.false;
                });
            });
        });
        describe("exists", function () {
            describe("when asserting an object should exist", function () {
                beforeEach(function () {
                    predicate = { "foo": { "exists": true } };
                });
                it("should return true if the object exists", function () {
                    var result = predicate_1.default(predicate, { "foo": 5 });
                    expect(result).to.be.true;
                });
                it("should return false if the object is undefined", function () {
                    var result = predicate_1.default(predicate, { "foo": undefined });
                    expect(result).to.be.false;
                });
                it("should return false if the object key doesn't exist", function () {
                    var result = predicate_1.default(predicate, {});
                    expect(result).to.be.false;
                });
            });
            describe("when asserting an object shouldn't exist", function () {
                beforeEach(function () {
                    predicate = { "foo": { "exists": false } };
                });
                it("should return false if the object exists", function () {
                    var result = predicate_1.default(predicate, { "foo": 5 });
                    expect(result).to.be.false;
                });
                it("should return true if the object is undefined", function () {
                    var result = predicate_1.default(predicate, { "foo": undefined });
                    expect(result).to.be.true;
                });
                it("should return true if the object key doesn't exist", function () {
                    var result = predicate_1.default(predicate, {});
                    expect(result).to.be.true;
                });
            });
        });
    });
    describe("combining multiple conditions", function () {
        describe("using an (implicit) AND", function () {
            beforeEach(function () {
                predicate = { "foo": { "lte": 10, "gte": 5 } };
            });
            it("should return true when both are true", function () {
                var result = predicate_1.default(predicate, { "foo": 7 });
                expect(result).to.be.true;
            });
            it("should not return true when only one is true", function () {
                var result1 = predicate_1.default(predicate, { "foo": 4 });
                expect(result1).to.be.false;
                var result2 = predicate_1.default(predicate, { "foo": 11 });
                expect(result2).to.be.false;
            });
        });
        describe("using an explicit OR", function () {
            context("when used at the top level of the predicate", function () {
                beforeEach(function () {
                    predicate = { "or": [
                            { "foo": { "eq": 3 } },
                            { "foo": { "eq": 5 } }
                        ] };
                });
                it("should trigger when the first condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 3 });
                    expect(result).to.be.true;
                });
                it("should trigger when the second condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 5 });
                    expect(result).to.be.true;
                });
                it("should not fire when neither condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 4 });
                    expect(result).to.be.false;
                });
            });
            context("within a predicate key", function () {
                beforeEach(function () {
                    predicate = { "foo": { "or": [
                                { "eq": 3 },
                                { "eq": 5 }
                            ] } };
                });
                it("should trigger when the first condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 3 });
                    expect(result).to.be.true;
                });
                it("should trigger when the second condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 5 });
                    expect(result).to.be.true;
                });
                it("should not fire when neither condition is met", function () {
                    var result = predicate_1.default(predicate, { foo: 4 });
                    expect(result).to.be.false;
                });
            });
        });
    });
    describe("combining multiple variables", function () {
        beforeEach(function () {
            predicate = { "foo": { "lte": 10 },
                "bar": { "gte": 5 } };
        });
        it("should return true when both are true", function () {
            var result = predicate_1.default(predicate, { "foo": 7, "bar": 7 });
            expect(result).to.be.true;
        });
        it("should not return true when only one is true", function () {
            var result1 = predicate_1.default(predicate, { "foo": 4, "bar": 4 });
            expect(result1).to.be.false;
            var result2 = predicate_1.default(predicate, { "foo": 11, "bar": 11 });
            expect(result2).to.be.false;
        });
    });
    describe("random numbers", function () {
        context("when the value is a random integer", function () {
            var result1, result2, result3;
            beforeEach(function () {
                var predicate = { "foo": {
                        "eq": { "randInt": [0, 6] }
                    } };
                result1 = predicate_1.default(predicate, { foo: 4, rngSeed: "knownSeed" });
                result2 = predicate_1.default(predicate, { foo: 1, rngSeed: "knownSeed" });
                result3 = predicate_1.default(predicate, { foo: 0, rngSeed: "knownSeed" });
            });
            afterEach(function () {
                keyPathify_1.default(undefined, { rngSeed: "erase" });
            });
            it("should compare against a seeded random number", function () {
                expect(result1).to.be.true;
                expect(result2).to.be.true;
                expect(result3).to.be.true;
            });
        });
    });
    describe("keypath predicates", function () {
        describe("checking the value of a keypath as input", function () {
            context("when the value matches", function () {
                it("should match the predicate", function () {
                    var predicate = { "foo.bar": { "lte": 10, "gte": 0 } };
                    var state = { foo: { bar: 5 } };
                    var result = predicate_1.default(predicate, state);
                    expect(result).to.be.true;
                });
            });
            context("when the predicate is not met", function () {
                it("should not be a match", function () {
                    var predicate = { "foo.bar": { "exists": false } };
                    var state = { foo: { bar: 5 } };
                    var result = predicate_1.default(predicate, state);
                    expect(result).to.be.false;
                });
            });
        });
        describe("checking a value against a keypath value", function () {
            context("when the value matches", function () {
                it("should match the predicate", function () {
                    var predicate = { "foo": { "lte": "bar.baz", "gte": "bar.baz" } };
                    var state = {
                        foo: "hello",
                        bar: { baz: "hello" }
                    };
                    var result = predicate_1.default(predicate, state);
                    expect(result).to.be.true;
                });
            });
            context("when the predicate is not met", function () {
                it("should not be a match", function () {
                    var predicate = { "foo": { "lte": "bar.baz" } };
                    var state = {
                        foo: 10,
                        bar: { baz: 5 }
                    };
                    var result = predicate_1.default(predicate, state);
                    expect(result).to.be.false;
                });
            });
        });
    });
});
