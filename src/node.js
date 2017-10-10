"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('underscore');
var Actions = require("./gameActions");
var Node = (function () {
    function Node(data, dispatch) {
        if (data === void 0) { data = {}; }
        Object.assign(this, data);
        this.dispatch = dispatch;
    }
    Node.prototype.playPassage = function (passageIndex) {
        if (!this.passages)
            return; // TODO: Better error handling
        var passage = this.passages[passageIndex];
        if (!passage || !this.dispatch)
            return;
        var hasContent = !_.isUndefined(passage.content);
        if (hasContent) {
            this.dispatch(Actions.OUTPUT, passage);
        }
        if (passage.set) {
            this.dispatch(Actions.SET_VARIABLES, passage.set);
        }
        if (!hasContent) {
            this.dispatch(Actions.COMPLETE_PASSAGE, passage.passageId);
        }
    };
    return Node;
}());
exports.Node = Node;
