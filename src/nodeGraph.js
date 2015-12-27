const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Graph {
  constructor(options) {
    this.nodes = options.nodes;
    this.startNode = options.startNode;
  }

  completePassage(passageId, state) {
    const currentNode = this._nodeWithId(state.graph.currentNodeId)
    const currentPassage = currentNode.passages[state.graph.currentPassageIndex];

    if (passageId !== currentPassage.passageId) return;

    const newPassageIndex = state.graph.currentPassageIndex + 1;

    if (newPassageIndex >= currentNode.passages.length) {
      if (this.dispatch) {
        this.dispatch(Actions.COMPLETE_NODE, currentNode.nodeId)
      }
    } else {
      if (this.dispatch) {
        this.dispatch(Actions.CHANGE_PASSAGE, newPassageIndex)
      }
    }
  }

  checkChoiceTransitions(state) {
    if (!state.graph.nodeComplete) return;

    const node = this._nodeWithId(state.graph.currentNodeId)
    if (!node.choices) return;

    let choices = node.choices.filter(function(choice) {
      return checkPredicate(choice.predicate, state)
    });

    if (choices.length > 0 && this.dispatch) {
      this.dispatch(Actions.CHANGE_NODE, choices[0].nodeId);
    }
  }

  playCurrentPassage(state) {
    const node = this._nodeWithId(state.graph.currentNodeId)
    const passage = node.passages[state.graph.currentPassageIndex]

    if (passage && this.dispatch) {
      this.dispatch(Actions.OUTPUT, passage);
    }
  }  

  //--

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}