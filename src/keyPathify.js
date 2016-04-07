const _ = require('underscore');
require('underscore-keypath');

const seedrandom = require('seedrandom');
var seed;
var rng = seedrandom();

export default function keyPathify(input, state, checkIfDefined = false) {
  // TODO: I'm not sure I like this solution.
  if (state.rngSeed && state.rngSeed !== seed) {
    seed = state.rngSeed
    rng = seedrandom(seed)
  }

  if (_.isObject(input)) {
    if(input.randInt && _.isArray(input.randInt)) {
      const lower = input.randInt[0];
      const upper = input.randInt[1];
      return Math.floor(rng() * (upper - lower)) + lower;
    } else {
      return input;
    }
  } else if (!_.isString(input)) {
    return input;
  }

  const result = _(state).valueForKeyPath(input)

  if (checkIfDefined && _.isUndefined(result)) {
    return input;
  }

  return result;
}