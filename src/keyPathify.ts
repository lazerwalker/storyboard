import * as _ from 'lodash'
const seedrandom = require('seedrandom');

import { State } from './state'

var seed: string|number|undefined;
var rng = seedrandom();

export default function keyPathify(input: string|any, state: any, checkIfDefined = false) {
  // TODO: I'm not sure I like this solution.
  if (state.rngSeed && state.rngSeed !== seed) {
    seed = state.rngSeed
    rng = seedrandom(seed)
  }

  // TODO: I'm not sure I like this object solution.
  // If I keep it, though, add a TS interface
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

  const result = _(state).get(input)

  if (checkIfDefined && _.isUndefined(result)) {
    return input;
  }

  return result;
}