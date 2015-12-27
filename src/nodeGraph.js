const _ = require('underscore')

import checkPredicate from "./predicate"
import * as Actions from "./gameActions"

export default class Graph {
  constructor(options) {
    this.nodes = options.nodes;
    this.startNode = options.startNode;

    this.currentNode = undefined;
    this.currentPassage = 0;

    this.outputs = new Map();
    this.inputs = new Map();
  }

  start() {
    this._setNode(this.startNode)
  }

  receiveInput(input, value) {
    this.inputs[input] = value;
    this._checkCurrentChoices();
  }

  completePassage(passageId) {
    if (passageId !== this._currentPassage.passageId) return;
    this.currentPassage++;

    if (this.currentPassage >= this._currentNode.passages.length) {
      this.nodeComplete = true;
      this._checkCurrentChoices();
    } else {
      this._playCurrentPassage();
    }
  }

  //--

  _setNode(nodeId) {
      this.currentNode = nodeId;
      this._currentNode = this._nodeWithId(nodeId);
      this._playCurrentNode();
  }

  _playCurrentNode() {
    if (!this._currentNode.passages) return;

    this.nodeComplete = false;
    this.currentPassage = 0;
    this._currentPassage = this._currentNode.passages[0];
    this._playCurrentPassage();
  }

  _playCurrentPassage() {
    const passage = this._currentNode.passages[this.currentPassage]    
    if (this.dispatch) {
      this.dispatch(Actions.OUTPUT, passage);
    }
  }

  _checkCurrentChoices() {
    if (!this._currentNode.choices) return;
    if (!this.nodeComplete) return;

    var _this = this;    
    let choices = this._currentNode.choices.filter(function(choice) {
      return checkPredicate(choice.predicate, _this.inputs)
    });

    if (choices.length > 0) {
      this._setNode(choices[0].nodeId);
    }
  }

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}