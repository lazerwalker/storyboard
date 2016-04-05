const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Node {
  constructor(data={}, dispatch) {
    Object.assign(this, data)
    this.dispatch = dispatch
  }

  playPassage(passageIndex) {
    const passage = this.passages[passageIndex]

    if (passage && this.dispatch) {
      this.dispatch(Actions.OUTPUT, passage);
    }
  }
}
