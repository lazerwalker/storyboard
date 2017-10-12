import * as Parser from "storyboard-lang";
import { Dispatch } from '../types/dispatch';
export declare class Node implements Parser.Node {
    constructor(data: {} | undefined, dispatch: Dispatch);
    readonly nodeId: Parser.NodeId;
    readonly passages?: Parser.Passage[];
    readonly choices?: Parser.Choice[];
    readonly track?: string;
    readonly predicate?: Parser.Predicate;
    readonly allowRepeats?: boolean;
    dispatch: Dispatch;
    playPassage(passageIndex: number): void;
}
