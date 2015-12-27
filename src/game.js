const _ = require('underscore')

import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

import * as Actions from "./gameActions"

export default class Game {
  constructor(options) {
    this.state = new Map();
    this.outputs = new Map();

    if (options.graph) {
      this.state.graph = new Map();
      this.graph = new NodeGraph(options.graph);
      this.graph.dispatch = _.bind(this.receiveDispatch, this)
    }

    if (options.bag) {
      this.bag = new NodeBag(options.bag);
    }
  }

  receiveDispatch(action, data) {
    if (action === Actions.OUTPUT) {
      let outputs = this.outputs[data.type];
      if (!outputs) return;

      for (let outputCallback of outputs) {
        outputCallback(data.content, data.passageId);
      }      
    } else if (action === Actions.CHANGE_NODE) {
      this.state.graph.currentNodeId = data;
      this.state.graph.nodeComplete = false;
      this.state.graph.currentPassageIndex = 0;

      this.graph.playCurrentPassage(this.state);
    } else if (action === Actions.CHANGE_PASSAGE) {
      this.state.graph.currentPassageIndex = data;
      this.graph.playCurrentPassage(this.state);
    } else if (action === Actions.COMPLETE_NODE) {
      this.state.graph.nodeComplete = true;
      this.graph.checkChoiceTransitions(this.state);
    }
  }

  start() {
    this.receiveDispatch(Actions.CHANGE_NODE, this.graph.startNode)
  }

  addOutput(type, callback) {
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
  }

  receiveInput(type, value) {
    this.state[type] = value;
    this.graph.checkChoiceTransitions(this.state);
  }

  completePassage(passageId) {
    this.graph.completePassage(passageId, this.state);
  }
}