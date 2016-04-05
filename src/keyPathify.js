const _ = require('underscore');
require('underscore-keypath');

export default function keyPathify(input, state, checkIfDefined = false) {
  if (!_.isString(input)) {
    return input;
  }

  const result = _(state).valueForKeyPath(input)

  if (checkIfDefined && _.isUndefined(result)) {
    return input;
  }

  return result;
}