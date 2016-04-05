const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Graph {
  constructor(options={}) {
    this.nodes = options.nodes || {};
    this.startNode = options.startNode;
  }

  completePassage(passageId, state) {
    const currentNode = this._nodeWithId(state.graph.currentNodeId)
    if (!currentNode) return;

    const currentPassage = currentNode.passages[state.graph.currentPassageIndex];
    if (passageId !== currentPassage.passageId) return;

    this.startNextPassage(state)
  }

  startNextPassage(state) { 
    const currentNode = this._nodeWithId(state.graph.currentNodeId)
    if (!currentNode) return

    let found = false
    let newPassageIndex = state.graph.currentPassageIndex
    while(!found) {
      newPassageIndex = newPassageIndex + 1
      if (_.isUndefined(currentNode.passages) || newPassageIndex >= currentNode.passages.length) {
        found = true;
        this.dispatch(Actions.COMPLETE_GRAPH_NODE, currentNode.nodeId)
      } else {
        const newPassage = currentNode.passages[newPassageIndex];
        if ((!newPassage.predicate) || checkPredicate(newPassage.predicate, state)) {
          found = true;
          this.dispatch(Actions.CHANGE_GRAPH_PASSAGE, newPassageIndex)
        }
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
      this.dispatch(Actions.MAKE_GRAPH_CHOICE, choices[0]);
    }
  }

  playCurrentPassage(state) {
    const node = this._nodeWithId(state.graph.currentNodeId)
    const passageIndex = state.graph.currentPassageIndex

    if (!node) return;

    node.playPassage(passageIndex)
  }  

  //--

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}