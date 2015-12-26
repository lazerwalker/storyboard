const _ = require('underscore');

export default function checkPredicate(predicate, state) {
  return _.reduce(predicate, function(memo, obj, input) {
    let value = memo;
    if (obj.gte) {
      value = value && (state[input] >= obj.gte);
    }
    if (obj.lte) {
      value = value && (state[input] <= obj.lte);
    }
    return value;
  }, true);
}