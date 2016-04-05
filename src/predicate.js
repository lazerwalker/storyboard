const _ = require('underscore');
import keyPathify from "./keyPathify"

export default function checkPredicate(predicate, state) {
  if (!predicate) { return true }

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
      bool = bool && (obj.exists !== _.isUndefined(keyPathify(value, state, true)));
    }
    return bool;
  }, true);
}