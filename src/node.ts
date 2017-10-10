const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"
import * as Parser from "storyboard-parser";

import { Dispatch } from '../types/dispatch'


export class Node implements Parser.Node {
  constructor(data={}, dispatch: Dispatch) {
    (<any>Object).assign(this, data)
    this.dispatch = dispatch
  }

  readonly nodeId: Parser.NodeId;
  readonly passages?: Parser.Passage[];
  readonly choices?: Parser.Choice[];
  readonly track?: string;
  readonly predicate?: Parser.Predicate;
  readonly allowRepeats?: boolean;

  dispatch: Dispatch;

  playPassage(passageIndex: number): void {
    if (!this.passages) return // TODO: Better error handling
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
