"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
require('underscore-keypath');
var seedrandom = require('seedrandom');
var seed;
var rng = seedrandom();
function keyPathify(input, state, checkIfDefined) {
    if (checkIfDefined === void 0) { checkIfDefined = false; }
    // TODO: I'm not sure I like this solution.
    if (state.rngSeed && state.rngSeed !== seed) {
        seed = state.rngSeed;
        rng = seedrandom(seed);
    }
    // TODO: I'm not sure I like this object solution.
    // If I keep it, though, add a TS interface
    if (_.isObject(input)) {
        if (input.randInt && _.isArray(input.randInt)) {
            var lower = input.randInt[0];
            var upper = input.randInt[1];
            return Math.floor(rng() * (upper - lower)) + lower;
        }
        else {
            return input;
        }
    }
    else if (!_.isString(input)) {
        return input;
    }
    var result = _(state).valueForKeyPath(input);
    if (checkIfDefined && _.isUndefined(result)) {
        return input;
    }
    return result;
}
exports.default = keyPathify;
