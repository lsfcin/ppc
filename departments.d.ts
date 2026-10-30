declare function findDepartment(list: any, name: any): any;
declare function mergeDepartments(list: any, disciplines: any): any[];
declare function ppcDepartments(): {
    addDepartment(name: any): any;
    pickDepartment(select: any): void;
};
declare const DEFAULT_DEPARTMENTS: string[];
declare const NEW_DEPARTMENT: "__new__";
