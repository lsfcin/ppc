declare function groupHours(d: any, groups: any): any;
declare function asList(value: any): any[];
declare function filterMatcher(app: any, filter: any): (d: any) => any;
declare function ruleHours(d: any, filter: any): any;
declare function measure(rule: any, ds: any): any;
declare function ruleLimit(app: any, rule: any): any;
declare function passes(rule: any, m: any, limit: any): boolean;
declare function formatMeasure(rule: any, m: any): string;
declare function evaluateEach(app: any, rule: any, limit: any): {
    ok: boolean;
    value: string;
};
declare function evaluateCourse(app: any, rule: any, limit: any): {
    ok: boolean;
    value: string;
};
declare function evaluateParts(app: any, rule: any, limit: any): {
    ok: boolean;
    value: string;
};
declare function evaluateRule(app: any, rule: any): {
    ok: boolean;
    value: string;
    id: any;
    label: any;
    detail: any;
    custom: boolean;
    detailOpen: boolean;
};
declare namespace RULE_SCOPES {
    let course: string;
    let period: string;
    let discipline: string;
}
declare namespace RULE_MEASURES {
    let hours: string;
    let weekly: string;
    let count: string;
    let ead: string;
}
declare namespace RULE_OPS {
    let min: string;
    let max: string;
    let multiple: string;
}
