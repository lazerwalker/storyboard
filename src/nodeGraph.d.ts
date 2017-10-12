import * as Parser from "storyboard-lang";
import { Dispatch } from '../types/dispatch';
import { Node } from './node';
import { State } from './state';
export declare class Graph implements Parser.StoryGraph {
    constructor(graph: Parser.StoryGraph | undefined, dispatch: Dispatch);
    readonly nodes: {
        [name: string]: Node;
    };
    readonly start: Parser.NodeId;
    readonly dispatch: Dispatch;
    completePassage(passageId: Parser.PassageId, state: State): void;
    startNextPassage(state: State): void;
    checkChoiceTransitions(state: State): void;
    playCurrentPassage(state: State): void;
    _nodeWithId(nodeId: Parser.NodeId | undefined): Node | undefined;
}
