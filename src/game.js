const _ = require('underscore')

import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

export default class Game {
  constructor(options) {
    if (options.graph) {
      this.graph = new NodeGraph(options.graph);
    }

    if (options.bag) {
      this.bag = new NodeBag(options.bag);
    }
  }
}