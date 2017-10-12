const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"
import * as Parser from "storyboard-lang"

import { Dispatch } from '../types/dispatch'
import { Node } from './node'
import { State } from './state'

export class Graph implements Parser.StoryGraph {

  constructor(graph: Parser.StoryGraph|undefined, dispatch: Dispatch) {
    if (graph) {
      this.nodes = _.mapObject(graph.nodes, (n: Parser.Node) => new Node(n, dispatch))
      this.start = graph.start;
    }
    this.dispatch = dispatch
  }

  readonly nodes: {[name: string]: Node}
  readonly start?: Parser.NodeId
  readonly dispatch: Dispatch

  completePassage(passageId: Parser.PassageId, state: State) {
    const currentNode = this._nodeWithId(state.graph.currentNodeId)
    if (!currentNode || !currentNode.passages || _.isUndefined(state.graph.currentPassageIndex)) return;

    const currentPassage = currentNode.passages![state.graph.currentPassageIndex!];
    if (passageId !== currentPassage.passageId) return;

    this.startNextPassage(state)
  }

  startNextPassage(state: State) {
    const currentNode = this._nodeWithId(state.graph.currentNodeId)
    if (!currentNode || _.isUndefined(state.graph.currentPassageIndex)) return;

    let found = false
    let newPassageIndex = state.graph.currentPassageIndex
    while(!found) {
      newPassageIndex = newPassageIndex! + 1
      if (_.isUndefined(currentNode.passages) || newPassageIndex >= currentNode.passages!.length) {
        found = true;
        this.dispatch(Actions.COMPLETE_GRAPH_NODE, currentNode.nodeId)
      } else {
        const newPassage = currentNode.passages![newPassageIndex];
        if ((!newPassage.predicate) || checkPredicate(newPassage.predicate, state)) {
          found = true;
          this.dispatch(Actions.CHANGE_GRAPH_PASSAGE, newPassageIndex)
        }
      }
    }
  }

  checkChoiceTransitions(state: State) {
    const node = this._nodeWithId(state.graph.currentNodeId)

    if (!(state.graph.nodeComplete && node && node.choices)) { return }

    let choices = node.choices.filter(function(choice) {
      return checkPredicate(choice.predicate, state)
    });

    if (choices.length > 0 && this.dispatch) {
      this.dispatch(Actions.MAKE_GRAPH_CHOICE, choices[0]);
    }
  }

  playCurrentPassage(state: State) {
    const node = this._nodeWithId(state.graph.currentNodeId)
    const passageIndex = state.graph.currentPassageIndex

    if (!node || _.isUndefined(passageIndex)) return;

    node.playPassage(passageIndex!)
  }

  //--

  _nodeWithId(nodeId: Parser.NodeId|undefined): Node|undefined {
    if (nodeId) {
      return this.nodes[nodeId];
    }
  }
}