const _ = require('underscore');
require("underscore-keypath");

import Node from "./node"
import NodeBag from "./nodeBag"
import NodeGraph from "./nodeGraph"

import * as Actions from "./gameActions"

const Game = function(options) {
  let bagNodes;
  let dispatch = _.bind(this.receiveDispatch, this)

  if (options.bag) {
    bagNodes = _.mapObject(options.bag, function(node, key) {
      return new Node(node, dispatch)
    });
  }

  let graphNodes;
  if (options.graph) {
    graphNodes = _.mapObject(options.graph.nodes, function(node, key) {
      return new Node(node, dispatch)
    });
  }

  this.started = false;

  this.state = new Map();
  this.outputs = new Map();

  this.state.graph = new Map();
  this.state.graph.choiceHistory = [];
  this.state.graph.nodeHistory = [];

  this.state.bag = new Map();
  this.state.bag.activePassageIds = {};
  this.state.bag.nodeHistory = new Map();
  this.state.bag.nodes = bagNodes;
  this.state.bag.activeTracks = new Map();

  const graph = Object.assign({}, options.graph, {nodes: graphNodes})
  this.graph = new NodeGraph(graph);
  this.bag = new NodeBag(bagNodes);

  for (let obj of [this.graph, this.bag]) {
    obj.dispatch = dispatch
  }
}

Game.prototype = {
  receiveDispatch: function(action, data) {
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
      this.bag.checkNodes(this.state);

      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, data.nodeId);

    } else if (action === Actions.CHANGE_GRAPH_NODE) {
      this.state.graph.currentNodeId = data;
      this.state.graph.nodeComplete = false;
      this.state.graph.currentPassageIndex = -1;

      this.graph.startNextPassage(this.state);
      this.bag.checkNodes(this.state);

    } else if (action === Actions.CHANGE_GRAPH_PASSAGE) {
      this.state.graph.currentPassageIndex = data;
      this.graph.playCurrentPassage(this.state);

    } else if (action === Actions.COMPLETE_GRAPH_NODE) {
      this.state.graph.nodeComplete = true;
      this.graph.checkChoiceTransitions(this.state);
      this.bag.checkNodes(this.state);

    } else if (action === Actions.TRIGGERED_BAG_NODES) {
      _.forEach(data, function(nodes, track) {
        const node = nodes[0];
        const nodeId = node.nodeId;

        this.state.bag.activePassageIds[nodeId] =  0;
        this.state.bag.activeTracks[node.track] = true
        this.bag.playCurrentPassage(nodeId, this.state);
      }, this)
    } else if (action === Actions.CHANGE_BAG_PASSAGE) {
      let [nodeId, passageIndex] = data;
      this.state.bag.activePassageIds[nodeId] = passageIndex;
      this.bag.playCurrentPassage(nodeId, this.state);

    } else if (action === Actions.COMPLETE_BAG_NODE) {
      const nodeId = data;
      delete this.state.bag.activePassageIds[nodeId];

      const node = this.state.bag.nodes[nodeId]
      this.state.bag.activeTracks[node.track] = false

      if (!this.state.bag.nodeHistory[nodeId]) {
        this.state.bag.nodeHistory[nodeId] = 0;
      } 

      this.state.bag.nodeHistory[nodeId]++;     
      this.bag.checkNodes(this.state);  

    } else if (action === Actions.RECEIVE_INPUT) {
      Object.assign(this.state, data)

      if (this.started) {
        this.graph.checkChoiceTransitions(this.state);
        this.bag.checkNodes(this.state);
      }
    }

    this.emitState();
  },

  start: function() {
    this.started = true;
    if (this.graph.startNode) {
      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, this.graph.startNode)
    } else {
      this.bag.checkNodes(this.state)
    }
  },

  addOutput: function(type, callback) {
    if (!this.outputs) this.outputs = {};
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
  },

  receiveInput: function(type, value) {
    let obj = {}
    obj[type] = value
    this.receiveDispatch(Actions.RECEIVE_INPUT, obj)
  },

  receiveMomentaryInput: function(type) {
    let trueObj = {}
    trueObj[type] = true
    this.receiveDispatch(Actions.RECEIVE_INPUT, trueObj)

    let falseObj = {}
    falseObj[type] = false
    this.receiveDispatch(Actions.RECEIVE_INPUT, falseObj)
  },

  completePassage: function(passageId) {
    this.graph.completePassage(passageId, this.state);
    this.bag.completePassage(passageId, this.state);
  },

  emitState: function() {
    if (this.stateListener) {
      let obj = Object.assign({}, this.state)
      delete obj.bag
      delete obj.graph // TODO: Keep this state
      const json = JSON.stringify(obj, null, 2)
      this.stateListener(json)
    }
  }
}

module.exports = Game