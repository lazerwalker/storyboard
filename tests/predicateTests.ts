import * as chai from 'chai';
import * as sinonChai from 'sinon-chai'
import { spy } from 'sinon'

chai.use(sinonChai);
const expect = chai.expect

import * as Parser from 'storyboard-lang'
import checkPredicate from '../src/predicate'
import keyPathify from '../src/keyPathify'

describe("predicates", () => {
  let predicate: Parser.Predicate;

  describe("predicate types", function() {
    describe("lte", function() {
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

    describe("eq", function() {
      beforeEach(function() {
        predicate = {"foo": {"eq": 5}}
      });

      context("numbers", function() {
        it("should fire for equal values", function() {
          const result = checkPredicate(predicate, {"foo": 5});
          expect(result).to.be.true
        })

        it("should not fire for greater values", function() {
          const result = checkPredicate(predicate, {"foo": 6});
          expect(result).to.be.false
        })

        it("should not fire for lesser values", function() {
          const result = checkPredicate(predicate, {"foo": 4});
          expect(result).to.be.false
        })
      })

      context("strings", function() {
        it("should return true when two strings are equal", function() {
          const predicate = {"foo": {"eq": "bar"}};
          const result = checkPredicate(predicate, {foo: "bar"})
          expect(result).to.be.true
        })

        it("should return false when two strings are not equal", function() {
          const predicate = {"foo": {"eq": "bar"}};
          const result = checkPredicate(predicate, {foo: "baz"})
          expect(result).to.be.false
        })

        it("should return false when the input value is a substring", function() {
          const predicate = {"foo": {"eq": "ba"}};
          const result = checkPredicate(predicate, {foo: "bar"})
          expect(result).to.be.false
        })

        it("should return false when the state value is a subtring", function() {
          const predicate = {"foo": {"eq": "bar"}};
          const result = checkPredicate(predicate, {foo: "ba"})
          expect(result).to.be.false
        })
      })
    })

    describe("exists", function() {
      describe("when asserting an object should exist", function() {
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
    describe("using an (implicit) AND", function() {
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
    })

    describe("using an explicit AND", () => {
      context("When used at the top level", () => {
        beforeEach(function() {
          predicate = {"and": [
            {"foo": {"gte": 3}},
            {"foo": {"lte": 5}}
          ]}
        })

        it("should not trigger when only the first condition is met", function() {
          const result = checkPredicate(predicate, {foo: 6})
          expect(result).to.be.false;
        });

        it("should not trigger when the only second condition is met", function() {
          const result = checkPredicate(predicate, {foo: 2})
          expect(result).to.be.false;
        });

        it("should fire when neither condition is met", function() {
          const result = checkPredicate(predicate, {foo: 4})
          expect(result).to.be.true;
        });
      })
    })

    describe("using an explicit OR", function() {
      context("when used at the top level of the predicate", function() {
        beforeEach(function() {
          predicate = {"or": [
            {"foo": {"eq": 3}},
            {"foo": {"eq": 5}}
          ]}
        })

        it("should trigger when the first condition is met", function() {
          const result = checkPredicate(predicate, {foo: 3})
          expect(result).to.be.true;
        });

        it("should trigger when the second condition is met", function() {
          const result = checkPredicate(predicate, {foo: 5})
          expect(result).to.be.true;
        });

        it("should not fire when neither condition is met", function() {
          const result = checkPredicate(predicate, {foo: 4})
          expect(result).to.be.false;
        });
      })

      // TODO: This behavior is deprecated?
      context("within a predicate key", function() {
        beforeEach(function() {
          predicate = {"foo": {"or": [
            {"eq": 3},
            {"eq": 5}
          ]}}
        })

        it("should trigger when the first condition is met", function() {
          const result = checkPredicate(predicate, {foo: 3})
          expect(result).to.be.true;
        });

        it("should trigger when the second condition is met", function() {
          const result = checkPredicate(predicate, {foo: 5})
          expect(result).to.be.true;
        });

        it("should not fire when neither condition is met", function() {
          const result = checkPredicate(predicate, {foo: 4})
          expect(result).to.be.false;
        });
      })
    })

  });

  describe("combining multiple variables", function() {
    beforeEach(function() {
      predicate = {"foo": {"lte": 10},
                   "bar": {"gte": 5}};
    });

    it("should return true when both are true", function() {
      const result = checkPredicate(predicate, {"foo": 7, "bar": 7});
      expect(result).to.be.true;
    });

    it("should not return true when only one is true", function() {
      const result1 = checkPredicate(predicate, {"foo": 4, "bar": 4});
      expect(result1).to.be.false;

      const result2 = checkPredicate(predicate, {"foo": 11, "bar": 11});
      expect(result2).to.be.false;
    });
  });

  describe("random numbers", function() {
    context("when the value is a random integer", function() {
      let result1: boolean, result2: boolean, result3: boolean;
      beforeEach(function() {
        const predicate = {"foo": {
          "eq": { "randInt": [0, 6] }
        }}

        result1 = checkPredicate(predicate, {foo: 4, rngSeed: "knownSeed"})
        result2 = checkPredicate(predicate, {foo: 1, rngSeed: "knownSeed"})
        result3 = checkPredicate(predicate, {foo: 0, rngSeed: "knownSeed"})
      })

      afterEach(function() {
        keyPathify(undefined, {rngSeed: "erase"})
      })

      it("should compare against a seeded random number", function() {
        expect(result1).to.be.true
        expect(result2).to.be.true
        expect(result3).to.be.true
      })
    })
  })

  describe("keypath predicates", function() {
    describe("checking the value of a keypath as input", function() {
      context("when the value matches", function() {
        it("should match the predicate", function() {
          const predicate  = {"foo.bar": {"lte": 10, "gte": 0}};
          const state = {foo: {bar: 5}}
          const result = checkPredicate(predicate, state);
          expect(result).to.be.true;
        });
      });

      context("when the predicate is not met", function() {
        it("should not be a match", function() {
          const predicate  = {"foo.bar": {"exists": false}};
          const state = {foo: {bar: 5}}
          const result = checkPredicate(predicate, state);
          expect(result).to.be.false;
        });
      });
    })

    describe("checking a value against a keypath value", function() {
      context("when the value matches", function() {
        it("should match the predicate", function() {
          const predicate  = {"foo": {"lte": "bar.baz", "gte": "bar.baz"}};
          const state = {
            foo: "hello",
            bar: { baz: "hello" }
          }
          const result = checkPredicate(predicate, state);
          expect(result).to.be.true;
        });
      });

      context("when the predicate is not met", function() {
        it("should not be a match", function() {
          const predicate  = {"foo": {"lte": "bar.baz"}};
          const state = {
            foo: 10,
            bar: { baz: 5 }
          }
          const result = checkPredicate(predicate, state);
          expect(result).to.be.false;
        });
      });
    });
  });
})