import * as Parser from 'storyboard-lang';
export declare class State {
    constructor();
    [key: string]: any;
    rngSeed?: string | number;
    graph: GraphState;
    bag: BagState;
}
export declare class GraphState {
    choiceHistory: Parser.Choice[];
    previousChoice?: Parser.Choice;
    nodeHistory: Parser.NodeId[];
    currentNodeId?: Parser.NodeId;
    previousNodeId?: Parser.NodeId;
    nodeComplete: boolean;
    currentPassageIndex?: number;
}
export declare class BagState {
    activePassageIndexes: {
        [nodeId: string]: number;
    };
    nodeHistory: {
        [key: string]: number;
    };
    activeTracks: {
        [trackName: string]: boolean;
    };
}
