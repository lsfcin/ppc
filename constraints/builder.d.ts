declare function ppcRuleBuilder(): {
    ruleDraft: null;
    openRuleModal(): void;
    closeRuleModal(): void;
    ruleMeasures(): any;
    ruleOps(): any;
    rulePercentAllowed(): boolean;
    normalizeRuleDraft(): void;
    ruleFilterOptions(): any;
    ruleValueText(r: any): string;
    ruleFilterText(r: any): string;
    ruleSentence(): string;
    ruleDraftInvalid(): boolean;
    saveRule(): void;
    deleteRule(id: any): void;
    ruleUsesGroup(id: any): boolean;
};
declare namespace MEASURES_BY_SCOPE {
    let course: string[];
    let period: string[];
    let discipline: string[];
}
declare namespace OPS_BY_MEASURE {
    let hours: string[];
    let weekly: string[];
    let count: string[];
    let ead: string[];
}
declare namespace RULE_FILTERS {
    let all: string;
    let category: string;
    let group: string;
    let department: string;
    let theme: string;
    let name: string;
}
declare function blankRule(): {
    scope: string;
    filter: {
        kind: string;
        value: string;
    };
    measure: string;
    op: string;
    value: number;
    unit: string;
    label: string;
    detail: string;
};
