declare function fixedRules(): any[];
declare const MANDATORY_NAMES: string[];
declare function groupMin(id: any, group: any, hours: any, label: any, detail: any): {
    id: any;
    fixed: boolean;
    scope: string;
    filter: {
        kind: string;
        value: any;
    };
    measure: string;
    op: string;
    value: any;
    unit: string;
    label: any;
    detail: any;
};
