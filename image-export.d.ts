declare function cleanClone(node: any): any;
declare function ppcImageExport(): {
    exportPNG(): Promise<void>;
};
declare const IMAGE_SKIP: ".toolbar, .tool-btn, .add-btn, .constraint-bar, .import-file, template";
