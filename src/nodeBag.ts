import * as _ from 'lodash'

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"
import * as Parser from "storyboard-lang"

import { Dispatch } from './dispatch'
import { Node } from './node'
import { State } from './state'

export class Bag {
  constructor(nodes: Parser.NodeBag|undefined, dispatch: Dispatch) {
    this.dispatch = dispatch
    this.nodes = _.mapValues(nodes || {}, (node, key) => {
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
    const filteredNodes = _.filter(this.nodes, (node) => checkPredicate(node.predicate, state));
    if (filteredNodes.length > 0 && this.dispatch) {
      const singleNodesByTrack = _(filteredNodes)
        .groupBy("track")
        .mapValues(_.sample) // TODO: Eventually let people pass in their own fitness fn
        .omitBy((_, track) => state.bag.activeTracks[track])
        .value()

      this.dispatch(Actions.TRIGGERED_BAG_NODES, singleNodesByTrack);
    }
  }

  playCurrentPassage(nodeId: Parser.NodeId, state: State) {
    const node = this.nodes[nodeId];
    if (!node) return;

    const passageIndex = state.bag.activePassageIndexes[nodeId];

    node.playPassage(passageIndex)
  }

  completePassage(passageId: Parser.PassageId, state: State) {
    const nodes = _.chain(state.bag.activePassageIndexes)
      .keys()
      .map((nodeId: string): Node => this.nodes[nodeId])
      .value()

    const node = _.find(nodes, (node: Node) => {
        return _.chain(node.passages)
          .map('passageId')
          .includes(passageId)
          .value()
      })

    if (!node || !node.passages) return;

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