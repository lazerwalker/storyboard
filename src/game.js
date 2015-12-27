const _ = require('underscore')

import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

import * as Actions from "./gameActions"

export default class Game {
  constructor(options) {
    this.state = new Map();
    this.outputs = new Map();

    if (options.graph) {
      this.graph = new NodeGraph(options.graph);
      this.graph.dispatch = ( (action, data) => this.receiveDispatch(action, data) )
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
    }
  }

  start() {
    this.graph.start();
  }

  addOutput(type, callback) {
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
  }

  // TODO: This is all temporary, until I figure out the proper object graph
  receiveInput(type, value) {
    this.graph.receiveInput(type, value);
  }

  completePassage(passageId) {
    this.graph.completePassage(passageId);
  }
}