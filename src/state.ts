import * as Parser from 'storyboard-parser'
import { Node } from './node'

export class State {
  constructor() {
    this.graph = new GraphState()
    this.bag = new BagState()
  }

  rngSeed?: string|number
  graph: GraphState;
  bag: BagState;
}

export class GraphState {
  choiceHistory: Parser.Choice[] = []
  previousChoice?: Parser.Choice

  nodeHistory: Parser.NodeId[] = []
  currentNodeId?: Parser.NodeId
  previousNodeId?: Parser.NodeId

  nodeComplete: boolean
  currentPassageIndex?: number
}

export class BagState {
  activePassageIndexes: {[nodeId: string]: number} = {}
  nodeHistory: {[key: string]: number} = {}
  activeTracks: {[trackName: string]: boolean} = {}
}