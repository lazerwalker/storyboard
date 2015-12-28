const _ = require('underscore');
require("underscore-keypath");

import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

import * as Actions from "./gameActions"

export default class Game {
  constructor(options) {
    this.state = new Map();
    this.outputs = new Map();

    this.state.graph = new Map();
    this.state.graph.choiceHistory = [];
    this.state.graph.nodeHistory = [];

    this.state.bag = new Map();
    this.state.bag.activePassageIds = {};
    this.state.bag.nodeHistory = new Map();
    this.state.bag.nodes = options.bag;

    this.graph = new NodeGraph(options.graph);
    this.bag = new NodeBag(options.bag);

    for (let obj of [this.graph, this.bag]) {
      obj.dispatch = _.bind(this.receiveDispatch, this)
    }
  }

  receiveDispatch(action, data) {
    if (action === Actions.OUTPUT) {
      let outputs = this.outputs[data.type];
      if (!outputs) return;

      for (let outputCallback of outputs) {
        const string = data.content.replace(
          /\{(.+?)\}/g,
          (match, keyPath) => _(this.state).valueForKeyPath(keyPath)
        );
        outputCallback(string, data.passageId);
      }      
    } else if (action === Actions.MAKE_GRAPH_CHOICE) {
      this.state.graph.previousNodeId = this.state.graph.currentNodeId;
      this.state.graph.nodeHistory.unshift(this.state.graph.currentNodeId);

      this.state.graph.previousChoice = Object.assign({}, data);
      this.state.graph.choiceHistory.unshift(Object.assign({}, data));

      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, data.nodeId);

    } else if (action === Actions.CHANGE_GRAPH_NODE) {
      this.state.graph.currentNodeId = data;
      this.state.graph.nodeComplete = false;
      this.state.graph.currentPassageIndex = 0;

      this.graph.playCurrentPassage(this.state);
      this.bag.checkNodes(this.state);

    } else if (action === Actions.CHANGE_GRAPH_PASSAGE) {
      this.state.graph.currentPassageIndex = data;
      this.graph.playCurrentPassage(this.state);

    } else if (action === Actions.COMPLETE_GRAPH_NODE) {
      this.state.graph.nodeComplete = true;
      this.graph.checkChoiceTransitions(this.state);
      this.bag.checkNodes(this.state);

    } else if (action === Actions.TRIGGERED_BAG_NODES) {
      const node = data[0];
      const nodeId = node.nodeId;

      this.state.bag.activePassageIds[nodeId] =  0;
      this.bag.playCurrentPassage(nodeId, this.state);

    } else if (action === Actions.CHANGE_BAG_PASSAGE) {
      let [nodeId, passageIndex] = data;
      this.state.bag.activePassageIds[nodeId] = passageIndex;
      this.bag.playCurrentPassage(nodeId, this.state);

    } else if (action === Actions.COMPLETE_BAG_NODE) {
      const nodeId = data;
      delete this.state.bag.activePassageIds[nodeId];

      if (!this.state.bag.nodeHistory[nodeId]) {
        this.state.bag.nodeHistory[nodeId] = 0;
      } 

      this.state.bag.nodeHistory[nodeId]++;     

      this.bag.checkNodes(this.state);      
    }
  }

  start() {
    if (this.graph.startNode) {
      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, this.graph.startNode)
    }
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
    this.bag.checkNodes(this.state);
  }

  completePassage(passageId) {
    this.graph.completePassage(passageId, this.state);
    this.bag.completePassage(passageId, this.state);
  }
}