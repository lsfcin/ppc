declare function codeChecks(app: any): ({
    id: string;
    warn: boolean;
    ok: boolean;
    label: string;
    value: string;
    detail: string;
    detailOpen: boolean;
} | {
    id: string;
    label: string;
    ok: boolean;
    value: string;
    detail: string;
    detailOpen: boolean;
    warn?: undefined;
})[];
declare function fixedRank(id: any): number;
declare function buildConstraints(app: any): any[];
declare function buildConstraintSummary(app: any): string;
