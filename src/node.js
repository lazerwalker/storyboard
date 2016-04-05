const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Node {
  constructor(data={}) {
    Object.assign(this, data)
  }
}
