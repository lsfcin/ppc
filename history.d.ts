declare function ppcHistory(): {
    _history: never[];
    _future: never[];
    _snapshot(): any;
    _pushHistory(): void;
    undo(): void;
    redo(): void;
};
