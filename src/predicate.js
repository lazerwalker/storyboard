const _ = require('underscore');
import keyPathify from "./keyPathify"

export default function checkPredicate(predicate, state) {
  if (!predicate) { return true }

  return _.reduce(predicate, function(memo, obj, key) {

    // TODO: If this is slow, only do valueForKeyPath for strings that need it
    const value = keyPathify(key, state)

    // TODO: Find a more generalizable version of this
    if (key === "or") {
      // 'or' expects an array of predicates. Return if any of them are true.
      if (!_.isArray(obj)) { return false }
      return _.reduce(obj, ((memo, p) =>  memo || checkPredicate(p, state)), false)
    }


    let bool = memo;

    if (!_.isUndefined(obj.eq)) {
       bool = bool && (value === keyPathify(obj.eq, state, true));
    }

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