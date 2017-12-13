import * as Parser from 'storyboard-lang'
import { Node } from './node'

export class State {
  constructor() {
    this.graph = new GraphState()
    this.bag = new BagState()
  }

  /** Whenever you set any state (either via `game.receiveInput` or `set foo to bar` in script), it gets shoved onto this object. */
  [key:string]: any;

  /** You can manually set an RNG seed for consistent pseudo-randomness.
   * Useful for e.g. testing.
   */
  rngSeed?: string|number

  graph: GraphState;
  bag: BagState;
}

export class GraphState {
  /** Every choice the player has made in the graph.
   *  Reverse chronological, so the 0th item is the most recent choice.
   */
  choiceHistory: Parser.Choice[] = []

  /** The most recent choice the player took. */
  previousChoice?: Parser.Choice

  /** The IDs of every completed graph node the player has visited, in reverse chronological order.
   * The 0th item is the *previous* node.
   * TODO: Should that be changed so that it includes the active node?
   */

  nodeHistory: Parser.NodeId[] = []

  /** The ID of the current active graph node */
  currentNodeId?: Parser.NodeId

  /** The ID of the previous completed node the player has visited */
  previousNodeId?: Parser.NodeId

  /** True if the current graph node has been completed, and is e.g. waiting for a choice to be made. */
  nodeComplete: boolean

  /** The index of the current active passage (starting with 0) within the active node */
  currentPassageIndex?: number
}

export class BagState {
  /** Indexes of all active bag passages, keyed by nodeId
   * e.g. { "foo": 0, "bar": 2} means that the "foo" node is playing its first
   * passage, and "bar" its second
   */
  activePassageIndexes: {[nodeId: string]: number} = {}

  /** The number of times each node has been completed.
   * Keys are nodeIds, values are play counts
   */
  nodeHistory: {[key: string]: number} = {}

  /** Whether a given track is active or not.
   *  Keys are track names. If a track is active, its value will be the node name
   */
  activeTracks: {[trackName: string]: string|undefined} = {}
}