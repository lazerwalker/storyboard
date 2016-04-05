const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Bag {
  constructor(nodes={}) {
    this.nodes = _.object(_.map(nodes, (node, key) => {
      if (!node.predicate) { node.predicate = {} }
      var newPredicate = {
        track: "default"
      }

      const activeKeyPath = `bag.activePassageIds.${node.nodeId}`;
      newPredicate[activeKeyPath] = {"exists": false};

      if(!node.allowRepeats) {
        const finishedKeypath = `bag.nodeHistory.${node.nodeId}`;
        newPredicate[finishedKeypath] = {"exists": false};
      }
      
      node.predicate = Object.assign({}, node.predicate, newPredicate);
      return [node.nodeId, node]
    }));
  }

  checkNodes(state) {
    const filteredNodes = _.filter(this.nodes, (node) => checkPredicate(node.predicate, state));
    if (filteredNodes.length > 0 && this.dispatch) {
      const nodesByTrack = _.groupBy(filteredNodes, "track")
      this.dispatch(Actions.TRIGGERED_BAG_NODES, nodesByTrack);
    }
  }

  playCurrentPassage(nodeId, state) {
    const node = this.nodes[nodeId];
    if (!node) return;

    const passageId = state.bag.activePassageIds[nodeId];

    node.playPassage(passageId)
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