"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
var keyPathify_1 = require("./keyPathify");
function checkPredicate(predicate, state) {
    if (!predicate) {
        return true;
    }
    function check(memo, obj, key) {
        // TODO: If this is slow, only do valueForKeyPath for strings that need it
        var value = keyPathify_1.default(key, state);
        // TODO: Find a more generalizable version of this
        if (key === "or") {
            // 'or' expects an array of predicates. Return if any of them are true.
            if (!_.isArray(obj)) {
                return false;
            }
            return _.reduce(obj, (function (memo, p) { return memo || checkPredicate(p, state); }), false);
        }
        if (!_.isUndefined(obj.or) && _.isArray(obj.or)) {
            // since check is built around the assumption that everything is ANDed,
            // we need to pass in true or else it will short-circuit.
            // This is pretty sloppy, and suggests an eventual better model is needed.
            memo = memo && _.reduce(obj.or, (function (m, o, k) { return m || check(true, o, key); }), false);
        }
        if (!_.isUndefined(obj.eq)) {
            memo = memo && (value === keyPathify_1.default(obj.eq, state, true));
        }
        if (!_.isUndefined(obj.gte)) {
            memo = memo && (value >= keyPathify_1.default(obj.gte, state, true));
        }
        if (!_.isUndefined(obj.lte)) {
            memo = memo && (value <= keyPathify_1.default(obj.lte, state, true));
        }
        if (!_.isUndefined(obj.exists)) {
            memo = memo && (obj.exists !== _.isUndefined(keyPathify_1.default(value, state, true)));
        }
        return memo;
    }
    return _.reduce(predicate, check, true);
}
exports.default = checkPredicate;
