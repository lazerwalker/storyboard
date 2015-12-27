const _ = require('underscore')

import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

export default class Game {
  constructor(options) {
    this.state = new Map();
    this.outputs = new Map();

    if (options.graph) {
      this.graph = new NodeGraph(options.graph);
    }

    if (options.bag) {
      this.bag = new NodeBag(options.bag);
    }
  }

  start() {
    this.graph.start();
  }

  // TODO: This is all temporary, until I figure out the proper object graph
  addOutput(type, callback) {
    this.graph.addOutput(type, callback);
  }

  receiveInput(type, value) {
    this.graph.receiveInput(type, value);
  }

  completePassage(passageId) {
    this.graph.completePassage(passageId);
  }
}