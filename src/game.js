"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
require("underscore-keypath");
var keyPathify_1 = require("./keyPathify");
var Actions = require("./gameActions");
var state_1 = require("./state");
var story_1 = require("./story");
var Parser = require("storyboard-lang");
var Game = /** @class */ (function () {
    function Game(storyData) {
        var _this = this;
        var story;
        if (typeof storyData === "string") {
            // TODO: Error handling
            story = Parser.parseString(storyData);
        }
        else {
            story = storyData;
        }
        var dispatch = _.bind(this.receiveDispatch, this);
        this.story = new story_1.Story(story, dispatch);
        this.state = new state_1.State();
        this.started = false;
        this.outputs = {};
        var that = this;
        this.addOutput("wait", function (timeout, passageId) {
            setTimeout(function () {
                _this.completePassage(passageId);
            }, parseInt(timeout));
        });
    }
    Game.prototype.receiveDispatch = function (action, data) {
        var _this = this;
        if (action === Actions.OUTPUT) {
            var outputs = this.outputs[data.type];
            if (!outputs)
                return;
            for (var _i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
                var outputCallback = outputs_1[_i];
                var string = data.content.replace(/\{(.+?)\}/g, function (match, keyPath) { return _(_this.state).valueForKeyPath(keyPath); });
                outputCallback(string, data.passageId);
            }
        }
        else if (action === Actions.MAKE_GRAPH_CHOICE) {
            if (!this.state.graph.currentNodeId)
                return;
            this.state.graph.previousNodeId = this.state.graph.currentNodeId;
            this.state.graph.nodeHistory.unshift(this.state.graph.currentNodeId);
            this.state.graph.previousChoice = Object.assign({}, data);
            this.state.graph.choiceHistory.unshift(Object.assign({}, data));
            this.story.bag.checkNodes(this.state);
            this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, data.nodeId);
        }
        else if (action === Actions.CHANGE_GRAPH_NODE) {
            this.state.graph.currentNodeId = data;
            this.state.graph.nodeComplete = false;
            this.state.graph.currentPassageIndex = -1;
            if (this.story.graph) {
                this.story.graph.startNextPassage(this.state);
            }
            this.story.bag.checkNodes(this.state);
        }
        else if (action === Actions.CHANGE_GRAPH_PASSAGE) {
            this.state.graph.currentPassageIndex = data;
            if (this.story.graph) {
                this.story.graph.playCurrentPassage(this.state);
            }
        }
        else if (action === Actions.COMPLETE_GRAPH_NODE) {
            this.state.graph.nodeComplete = true;
            if (this.story.graph) {
                this.story.graph.checkChoiceTransitions(this.state);
            }
            this.story.bag.checkNodes(this.state);
        }
        else if (action === Actions.TRIGGERED_BAG_NODES) {
            _.forEach(data, function (nodes, track) {
                var node = nodes[0];
                var nodeId = node.nodeId;
                this.state.bag.activePassageIndexes[nodeId] = 0;
                // TODO: We should have a BagNode class that always has track defined
                this.state.bag.activeTracks[node.track] = true;
                this.story.bag.playCurrentPassage(nodeId, this.state);
            }, this);
        }
        else if (action === Actions.CHANGE_BAG_PASSAGE) {
            var nodeId = data[0], passageIndex = data[1];
            this.state.bag.activePassageIndexes[nodeId] = passageIndex;
            this.story.bag.playCurrentPassage(nodeId, this.state);
        }
        else if (action === Actions.COMPLETE_BAG_NODE) {
            var nodeId = data;
            delete this.state.bag.activePassageIndexes[nodeId];
            var node = this.story.bag.nodes[nodeId];
            // TODO: Waiting on having a BagNode thing
            this.state.bag.activeTracks[node.track] = false;
            if (!this.state.bag.nodeHistory[nodeId]) {
                this.state.bag.nodeHistory[nodeId] = 0;
            }
            this.state.bag.nodeHistory[nodeId]++;
            this.story.bag.checkNodes(this.state);
        }
        else if (action === Actions.RECEIVE_INPUT) {
            var newState_1 = Object.assign({}, this.state);
            _.each(Object.keys(data), function (key) {
                if (!_(newState_1).setValueForKeyPath(key, data[key])) {
                    newState_1[key] = data[key];
                }
            });
            Object.assign(this.state, newState_1);
            if (this.started) {
                if (this.story.graph) {
                    this.story.graph.checkChoiceTransitions(this.state);
                }
                this.story.bag.checkNodes(this.state);
            }
        }
        else if (action === Actions.SET_VARIABLES) {
            var keyPathedData = _.mapObject(data, function (val, key) {
                return keyPathify_1.default(val, this.state, true);
            }, this);
            Object.assign(this.state, keyPathedData);
            if (this.started) {
                if (this.story.graph) {
                    this.story.graph.checkChoiceTransitions(this.state);
                }
                this.story.bag.checkNodes(this.state);
            }
        }
        else if (action === Actions.COMPLETE_PASSAGE) {
            this.completePassage(data);
        }
        this.emitState();
    };
    Game.prototype.start = function () {
        this.started = true;
        if (this.story.graph && this.story.graph.start) {
            this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, this.story.graph.start);
        }
        else {
            this.story.bag.checkNodes(this.state);
        }
    };
    Game.prototype.addOutput = function (type, callback) {
        if (!this.outputs[type]) {
            this.outputs[type] = [];
        }
        this.outputs[type].push(callback);
    };
    Game.prototype.receiveInput = function (type, value) {
        var obj = {};
        obj[type] = value;
        this.receiveDispatch(Actions.RECEIVE_INPUT, obj);
    };
    Game.prototype.receiveMomentaryInput = function (type, value) {
        var trueObj = {};
        trueObj[type] = value || true;
        this.receiveDispatch(Actions.RECEIVE_INPUT, trueObj);
        var falseObj = {};
        falseObj[type] = undefined;
        this.receiveDispatch(Actions.RECEIVE_INPUT, falseObj);
    };
    Game.prototype.completePassage = function (passageId) {
        if (this.story.graph) {
            this.story.graph.completePassage(passageId, this.state);
        }
        this.story.bag.completePassage(passageId, this.state);
    };
    Game.prototype.emitState = function () {
        if (this.stateListener) {
            var obj = Object.assign({}, this.state);
            delete obj.story.bag;
            delete obj.story.graph; // TODO: Keep this state
            var json = JSON.stringify(obj, null, 2);
            this.stateListener(json);
        }
    };
    return Game;
}());
exports.Game = Game;
