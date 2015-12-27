const _ = require('underscore');
require('underscore-keypath');

export default function checkPredicate(predicate, state) {
  return _.reduce(predicate, function(memo, obj, input) {

    // TODO: If this is slow, only do valueForKeyPath for strings that need it
    const value = _(state).valueForKeyPath(input);

    let bool = memo;
    if (!_.isUndefined(obj.gte)) {
      bool = bool && (value >= obj.gte);
    }
    if (!_.isUndefined(obj.lte)) {
      bool = bool && (value <= obj.lte);
    }
    if (!_.isUndefined(obj.exists)) {
      bool = bool && (obj.exists !== _.isUndefined(value));
    }
    return bool;
  }, true);
}