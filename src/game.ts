// TODO: Look into how much of the lodash functionality we're using
// has been pulled into vanilla TS/JS
import * as _ from "lodash"

/* Identified parser issues
- Spaces in node IDs
- Can we avoid needing node IDs for bag nodes?
- asterisks in comments
- text like [[this]] in a variable setting
- to confirm: if you have a passage with a predicate, can you have (a) multiple passages tied to that predicate, and/or (b) non-predicated passages after it?
*/

import keyPathify from "./keyPathify"

import * as Actions from "./gameActions"

import { Node } from './node'
import { State } from './state'
import { Story } from './story'
import * as Parser from 'storyboard-lang'
import { Dispatch } from './dispatch'

export type OutputCallback = ((content: string, passageId: Parser.PassageId, track: String) => void)
export type ObserverCallback = ((content: any) => void)

export class Game {
  observers: {[keypath: string]: ObserverCallback[]}

  constructor(storyData: string|Parser.Story, initialState?: State) {
    let story: Parser.Story
    if (typeof storyData === "string") {
        story = Parser.parseString(storyData)!
      if (!story) {
        // I'm having trouble handling this error properly. This is a hack.
        this.valid = false
        console.log("Throwing invalid story")
        throw("Invalid story")
      }
    } else {
      story = storyData
    }
      
    let dispatch = _.bind(this.receiveDispatch, this) as Dispatch
    this.story = new Story(story, dispatch)
    this.state = new State(initialState)

    this.started = false;

    this.outputs = {};
    this.observers = {};

    var that = this; // TODO: I don't think this does anything?
    this.addOutput("wait", (timeout: string, passageId: Parser.PassageId) => {
      setTimeout(() => {
        this.completePassage(passageId);
      }, parseInt(timeout))
    });
  }

  readonly story: Story;
  state: State;

  outputs: {[name: string]: OutputCallback[]}
  started: boolean;

  stateListener?:((state: State) => void)
  jsonStateListener?: ((serializedState: string) => void)

  receiveDispatch(action: string, data: any) {
    if (action === Actions.OUTPUT) {
      let outputs = this.outputs[data.type];
      if (!outputs) return;

      for (let outputCallback of outputs) {
        const string = data.content.replace(
          /\{(.+?)\}/g,
          (match: string, keyPath: string) => _(this.state).get(keyPath)
        );
        outputCallback(string, data.passageId, data.track);
      }
    } else if (action === Actions.MAKE_GRAPH_CHOICE) {
      if (!this.state.graph.currentNodeId) return

      this.state.graph.previousNodeId = this.state.graph.currentNodeId;
      this.state.graph.nodeHistory.unshift(this.state.graph.currentNodeId)
      this.state.graph.previousChoice = (<any>Object).assign({}, data);
      this.state.graph.choiceHistory.unshift((<any>Object).assign({}, data));

      this.story.bag.checkNodes(this.state);

      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, data.nodeId);

    } else if (action === Actions.CHANGE_GRAPH_NODE) {
      this.state.graph.currentNodeId = data;
      this.state.graph.nodeComplete = false;
      this.state.graph.currentPassageIndex = -1;

      if (this.story.graph) {
        this.story.graph.startNextPassage(this.state);
      }

      this.story.bag.checkNodes(this.state);

    } else if (action === Actions.CHANGE_GRAPH_PASSAGE) {
      this.state.graph.currentPassageIndex = data;

      if (this.story.graph) {
        this.story.graph.playCurrentPassage(this.state);
      }
    } else if (action === Actions.COMPLETE_GRAPH_NODE) {
      this.state.graph.nodeComplete = true;

      if (this.story.graph) {
        this.story.graph.checkChoiceTransitions(this.state);
      }

      this.story.bag.checkNodes(this.state);

    } else if (action === Actions.TRIGGERED_BAG_NODES) {
      _.forEach(data, (node: Node, track: string) => {
        const nodeId = node.nodeId;

        this.state.bag.activePassageIndexes[nodeId] =  0;
        this.state.bag.activeTracks[node.track] = nodeId
        this.story.bag.playCurrentPassage(nodeId, this.state);
      })
    } else if (action === Actions.CHANGE_BAG_PASSAGE) {
      let [nodeId, passageIndex] = data;
      this.state.bag.activePassageIndexes[nodeId] = passageIndex;
      this.story.bag.playCurrentPassage(nodeId, this.state);

    } else if (action === Actions.COMPLETE_BAG_NODE) {
      const nodeId = data;
      delete this.state.bag.activePassageIndexes[nodeId];

      const node = this.story.bag.nodes[nodeId]
      delete this.state.bag.activeTracks[node.track!]

      if (!this.state.bag.nodeHistory[nodeId]) {
        this.state.bag.nodeHistory[nodeId] = 0;
      }

      this.state.bag.nodeHistory[nodeId]++;
      this.story.bag.checkNodes(this.state);

    } else if (action === Actions.RECEIVE_INPUT) {
      let newState =_.assign({}, this.state)
      _.forIn(data, (value: any, key: string) => {
        _.set(newState, key, keyPathify(value, this.state, true))
      });
      this.state = {...this.state, ...newState}

      _.forIn(data, (value: any, key: string) => {
        if (this.observers[key]) {
          _.forEach(this.observers[key], (fn) => fn(value))
        }
      })

      if (this.started) {
        if (this.story.graph) {
          this.story.graph.checkChoiceTransitions(this.state);
        }

        this.story.bag.checkNodes(this.state);
      }
    } else if (action === Actions.SET_VARIABLES) {
      let newState =_.assign({}, this.state)
      _.forIn(data, (value: any, key: string) => {
        _.set(newState, key, keyPathify(value, this.state, true))
      });
      _.assign(this.state, newState)

      _.forIn(data, (value: any, key: string) => {
        if (this.observers[key]) {
          _.forEach(this.observers[key], (fn) => fn(value))
        }
      })

      if (this.started) {
        if (this.story.graph) {
          this.story.graph.checkChoiceTransitions(this.state);
        }

        this.story.bag.checkNodes(this.state);
      }
    } else if (action === Actions.COMPLETE_PASSAGE) {
      this.completePassage(data);
    }

    this.emitState();
  }

  start() {
    this.started = true;
    if (this.story.graph && this.story.graph.start) {
      this.receiveDispatch(Actions.CHANGE_GRAPH_NODE, this.story.graph.start)
    } else {
      this.story.bag.checkNodes(this.state)
    }
  }

  addOutput(type: string, callback: OutputCallback) {
    if (!this.outputs[type]) {
      this.outputs[type] = [];
    }
    this.outputs[type].push(callback);
  }

  // TODO: What's the difference between this and emitState?
  addObserver(type: string, callback: ObserverCallback) {
    if (!this.observers[type]) {
      this.observers[type] = []
    }
    this.observers[type].push(callback)
  }

  removeObserver(type: string, callback: ObserverCallback) {
    this.observers[type] = _.without(this.observers[type], callback)
  }

  receiveInput(type: string, value: any) {
    let obj: any = {}
    obj[type] = value
    this.receiveDispatch(Actions.RECEIVE_INPUT, obj)
  }

  receiveMomentaryInput(type: string, value?: any) {
    let trueObj: any = {}
    trueObj[type] = value || true
    this.receiveDispatch(Actions.RECEIVE_INPUT, trueObj)

    let falseObj: any = {}
    falseObj[type] = undefined
    this.receiveDispatch(Actions.RECEIVE_INPUT, falseObj)
  }

  completePassage(passageId: Parser.PassageId) {
    if (this.story.graph) {
      this.story.graph.completePassage(passageId, this.state);
    }

    this.story.bag.completePassage(passageId, this.state);
  }

  emitState() {
    if (this.stateListener) {
      this.stateListener({...this.state})
    }

    if (this.jsonStateListener) {
      const json = JSON.stringify(this.state, null, 2)
      this.jsonStateListener(json)
    }
  }
}