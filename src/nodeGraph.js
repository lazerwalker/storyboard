const _ = require('underscore')

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
    this.currentNode = this.startNode;
    this._currentNode = this._nodeWithId(this.currentNode)

    this._playCurrentNode();
  }

  addOutput(type, callback) {
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
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

  _playCurrentNode() {
    if (!this._currentNode.passages) return;

    this.nodeComplete = false;
    this.currentPassage = 0;
    this._currentPassage = this._currentNode.passages[0];
    this._playCurrentPassage();
  }

  _playCurrentPassage() {
    const passage = this._currentNode.passages[this.currentPassage]    
    let outputs = this.outputs[passage.type];
    if (!outputs) return;

    for (let outputCallback of outputs) {
      outputCallback(passage.content);
    }
  }

  _checkCurrentChoices() {
    if (!this._currentNode.choices) return;
    if (!this.nodeComplete) return;

    var _this = this;    
    let choices = this._currentNode.choices.filter(function(choice) {
      return _.reduce(choice.predicate, function(memo, obj, input) {
        return memo && (_this.inputs[input] >= obj.gte)
      }, true);
    });

    if (choices.length > 0) {
      const newNode = choices[0].nodeId;
      this.currentNode = newNode;
      this._currentNode = this._nodeWithId(newNode);
      this._playCurrentNode();
    }
  }

  _nodeWithId(nodeId) {
    return this.nodes[nodeId];
  }
}