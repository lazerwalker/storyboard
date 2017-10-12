const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"
import * as Parser from "storyboard-lang"

import { Dispatch } from '../types/dispatch'
import { Node } from './node'
import { State } from './state'

export class Bag {
  constructor(nodes: Parser.NodeBag|undefined, dispatch: Dispatch) {
    this.dispatch = dispatch
    this.nodes = _.mapObject(nodes || {}, (node: Parser.Node, key: string) => {
      // TODO: Rip this out into a "BagNode" object? Should these apply to normal nodes?
      if (!node.predicate) { node.predicate = {} }
      var newPredicate: Parser.Predicate = {
        track: "default"
      }

      const activeKeyPath = `bag.activePassageIndexes.${node.nodeId}`;
      newPredicate[activeKeyPath] = {"exists": false};

      if(!node.allowRepeats) {
        const finishedKeypath = `bag.nodeHistory.${node.nodeId}`;
        newPredicate[finishedKeypath] = {"exists": false};
      }

      node.predicate = (<any>Object).assign({}, node.predicate, newPredicate);
      return new Node(node, dispatch)
    });
  }

  readonly nodes: {[nodeId: string]: Node}
  readonly dispatch: Dispatch

  checkNodes(state: State) {
    const filteredNodes = _.filter(this.nodes, (node: Node) => checkPredicate(node.predicate, state));
    if (filteredNodes.length > 0 && this.dispatch) {
      const nodesByTrack = _.groupBy(filteredNodes, "track")
      this.dispatch(Actions.TRIGGERED_BAG_NODES, nodesByTrack);
    }
  }

  playCurrentPassage(nodeId: Parser.NodeId, state: State) {
    const node = this.nodes[nodeId];
    if (!node) return;

    const passageIndex = state.bag.activePassageIndexes[nodeId];

    node.playPassage(passageIndex)
  }

  completePassage(passageId: Parser.PassageId, state: State) {
    var node = _(state.bag.activePassageIndexes).chain()
      .keys()
      .map( (nodeId: string) => this.nodes[nodeId] )
      .find( function(node: Node) {
        return _(node.passages).chain()
          .pluck('passageId')
          .contains(passageId)
          .value();
      }).value();

    if (!node) return;

    const currentIndex = state.bag.activePassageIndexes[node.nodeId];
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