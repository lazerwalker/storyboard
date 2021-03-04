import * as _ from 'lodash'
import keyPathify from "./keyPathify"

import { State } from './state'
import { Predicate } from 'storyboard-lang'

export default function checkPredicate(predicate: Predicate|undefined, state: any) {
  if (!predicate) { return true }

  function check(memo: any, obj: any, key: string): boolean {
    // TODO: If this is slow, only do valueForKeyPath for strings that need it
    const value = keyPathify(key, state)

    if (key === "or") {
      if (!_.isArray(obj)) { return false }
      return _.reduce(obj, ((memo: any, p: Predicate) =>  memo || checkPredicate(p, state)), false)
    }

    if (key === "and") {
      if (!_.isArray(obj)) { return false}
      return _.reduce(obj, ((memo: any, p: Predicate) =>  memo && checkPredicate(p, state)), true)
    }


    if (!_.isUndefined(obj.or) && _.isArray(obj.or)) {
      // since check is built around the assumption that everything is ANDed,
      // we need to pass in true or else it will short-circuit.
      // This is pretty sloppy, and suggests an eventual better model is needed.
      memo = memo && _.reduce(obj.or, ((m: any, o: any, k: string) => m || check(true, o, key)), false)
    }

    if (!_.isUndefined(obj.eq)) {
       memo = memo && (value === obj.eq || (value === keyPathify(obj.eq, state, true)))
    }

    if (!_.isUndefined(obj.gte)) {
      memo = memo && (value >= keyPathify(obj.gte, state, true));
    }
    if (!_.isUndefined(obj.lte)) {
      memo = memo && (value <= keyPathify(obj.lte, state, true));
    }
    if (!_.isUndefined(obj.exists)) {
      memo = memo && (obj.exists !== _.isUndefined(keyPathify(value, state, true)));
    }
    return memo;
  }

  return _.reduce(predicate, check, true)
}