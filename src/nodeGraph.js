export default class Graph {
  constructor(options) {
    this.nodes = options.nodes;
    this.startNode = options.startNode;

    this.currentNode = undefined;
  }

  start() {
    this.currentNode = this.startNode;
  }

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}