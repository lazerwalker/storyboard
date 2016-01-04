const _ = require('underscore');
require('underscore-keypath');

const keyPathify = function(input, state, checkIfDefined = false) {
  if (!_.isString(input)) {
    return input;
  }

  const result = _(state).valueForKeyPath(input)

  if (checkIfDefined && _.isUndefined(result)) {
    return input;
  }

  return result;
}

export default function checkPredicate(predicate, state) {
  if (!predicate) { return false }

  return _.reduce(predicate, function(memo, obj, input) {

    // TODO: If this is slow, only do valueForKeyPath for strings that need it
    const value = keyPathify(input, state)

    let bool = memo;
    if (!_.isUndefined(obj.gte)) {
      bool = bool && (value >= keyPathify(obj.gte, state, true));
    }
    if (!_.isUndefined(obj.lte)) {
      bool = bool && (value <= keyPathify(obj.lte, state, true));
    }
    if (!_.isUndefined(obj.exists)) {
      bool = bool && (obj.exists !== _.isUndefined(value));
    }
    return bool;
  }, true);
}