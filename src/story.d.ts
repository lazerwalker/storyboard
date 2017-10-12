import { Bag } from "./nodeBag";
import { Graph } from "./nodeGraph";
import * as Parser from "storyboard-lang";
import { Dispatch } from '../types/dispatch';
export declare class Story {
    constructor(storyData: Parser.Story, dispatch: Dispatch);
    graph?: Graph;
    bag: Bag;
}
