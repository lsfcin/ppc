declare function mergeGroups(list: any, disciplines: any, categories: any): any;
declare function ppcGroups(): {
    _stagingGroups: null;
    extensionGroup(): string;
    groupLabel(id: any): any;
    teachingGroups(): any;
    defaultGroup(): any;
    groupIndex(id: any): any;
    groupInUse(id: any): any;
    addStagingGroup(): void;
    deleteStagingGroup(idx: any): void;
};
declare const EXTENSION_GROUP: "III";
declare const DEFAULT_GROUPS: ({
    id: string;
    label: string;
    locked?: undefined;
} | {
    id: string;
    label: string;
    locked: boolean;
})[];
