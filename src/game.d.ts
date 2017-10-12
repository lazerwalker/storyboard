import { State } from './state';
import { Story } from './story';
import * as Parser from 'storyboard-lang';
export declare type OutputCallback = ((content: string, passageId: Parser.PassageId) => void);
export declare class Game {
    constructor(storyData: string | Parser.Story);
    readonly story: Story;
    state: State;
    outputs: {
        [name: string]: OutputCallback[];
    };
    started: boolean;
    stateListener?: ((serializedState: string) => void);
    receiveDispatch(action: string, data: any): void;
    start(): void;
    addOutput(type: string, callback: OutputCallback): void;
    receiveInput(type: string, value: any): void;
    receiveMomentaryInput(type: string, value?: string): void;
    completePassage(passageId: Parser.PassageId): void;
    emitState(): void;
}
