export default class Graph {
  constructor(options) {
    this.nodes = options.nodes;
    this.startNode = options.startNode;

    this.currentNode = undefined;

    this.outputs = {};
  }

  start() {
    this.currentNode = this.startNode;
    this._playCurrentNode();
  }

  addOutput(type, callback) {
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
  }

  //--

  _playCurrentNode() {
    var node = this._nodeWithId(this.currentNode);
    if (!node.passages) return;

    for (let passage of node.passages) {
      let outputs = this.outputs[passage.type];
      if (!outputs) continue;
      for (let outputCallback of outputs) {
        outputCallback(passage.content);
      }
    }
  }

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}