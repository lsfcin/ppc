declare function ppcCategories(): {
    _stagingCategories: null;
    openCategoriesModal(): void;
    saveCategoriesModal(): void;
    closeCategoriesModal(): void;
    addStagingCategory(): void;
    deleteStagingCategory(idx: any): void;
    inUseCount(value: any): any;
    addPeriod(): void;
    removeLastPeriod(): void;
    exportJSON(): void;
    importJSON(evt: any): void;
};
