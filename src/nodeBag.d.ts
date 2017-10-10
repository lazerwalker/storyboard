import * as Parser from "storyboard-parser";
import { Dispatch } from '../types/dispatch';
import { Node } from './node';
import { State } from './state';
export declare class Bag {
    constructor(nodes: Parser.NodeBag | undefined, dispatch: Dispatch);
    readonly nodes: {
        [nodeId: string]: Node;
    };
    readonly dispatch: Dispatch;
    checkNodes(state: State): void;
    playCurrentPassage(nodeId: Parser.NodeId, state: State): void;
    completePassage(passageId: Parser.PassageId, state: State): void;
}
