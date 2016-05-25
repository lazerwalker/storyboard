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

    if (!passage || !this.dispatch) return

    const hasContent = !_.isUndefined(passage.content)

    if (hasContent) {
      this.dispatch(Actions.OUTPUT, passage);
    }

    if (passage.set) {
      this.dispatch(Actions.SET_VARIABLES, passage.set)
    }

    if (!hasContent) {
      this.dispatch(Actions.COMPLETE_PASSAGE, passage.passageId);
    }
  }
}
