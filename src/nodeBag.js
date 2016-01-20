const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Bag {
  constructor(nodes={}) {
    this.nodes = _.object(_.map(nodes, (node, key) => {
      const activeKeyPath = "bag.activePassageIds." + node.nodeId
      const finishedKeypath = "bag.nodeHistory." + node.nodeId
      var newPredicate = {}
      if (!node.predicate) { node.predicate = {} }
      newPredicate[activeKeyPath] = {"exists": false}
      newPredicate[finishedKeypath] = {"exists": false}
      node.predicate = Object.assign({}, node.predicate, newPredicate);
      return [node.nodeId, node]
    }));
  }

  checkNodes(state) {
    const filteredNodes = _.filter(this.nodes, (node) => checkPredicate(node.predicate, state));
    if (filteredNodes.length > 0 && this.dispatch) {
      this.dispatch(Actions.TRIGGERED_BAG_NODES, filteredNodes);
    }
  }

  playCurrentPassage(nodeId, state) {
    const index = state.bag.activePassageIds[nodeId];
    const node = this.nodes[nodeId];
    if (!node) return;

    const passage = node.passages[index];
    if (!passage) return;

    this.dispatch(Actions.OUTPUT, passage);
  }

  completePassage(passageId, state) {
    var node = _(state.bag.activePassageIds).chain()
      .keys()
      .map( (nodeId) => state.bag.nodes[nodeId] )
      .find( function(node) {
        return _(node.passages).chain()
          .pluck('passageId')
          .contains(passageId)
          .value();
      }).value();

    if (!node) return;

    const currentIndex = state.bag.activePassageIds[node.nodeId];
    const currentPassage = node.passages[currentIndex];
    if (passageId !== currentPassage.passageId) return;

    const newIndex = currentIndex + 1;

    if (newIndex >= node.passages.length) {
      this.dispatch(Actions.COMPLETE_BAG_NODE, node.nodeId)
    } else {
      this.dispatch(Actions.CHANGE_BAG_PASSAGE, [node.nodeId, newIndex])
    }
  }
}