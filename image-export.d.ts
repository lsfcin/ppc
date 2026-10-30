declare function cleanClone(node: any): any;
declare function ppcImageExport(): {
    exportImage(format: any): Promise<void>;
};
declare const IMAGE_SKIP: ".toolbar, .tool-btn, .add-btn, .constraint-bar, .import-file, template";
