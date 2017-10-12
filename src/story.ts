import { Bag } from "./nodeBag"
import { Graph } from "./nodeGraph"

import * as Parser from "storyboard-lang"

import { Dispatch } from '../types/dispatch'

export class Story {
  constructor(storyData: Parser.Story, dispatch: Dispatch) {
    if (storyData.graph) {
      this.graph = new Graph(storyData.graph, dispatch)
    }

    this.bag = new Bag(storyData.bag, dispatch)
  }

  graph?: Graph
  bag: Bag
}