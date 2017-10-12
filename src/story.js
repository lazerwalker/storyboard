"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodeBag_1 = require("./nodeBag");
var nodeGraph_1 = require("./nodeGraph");
var Story = /** @class */ (function () {
    function Story(storyData, dispatch) {
        if (storyData.graph) {
            this.graph = new nodeGraph_1.Graph(storyData.graph, dispatch);
        }
        this.bag = new nodeBag_1.Bag(storyData.bag, dispatch);
    }
    return Story;
}());
exports.Story = Story;
