

const build = function (this: JiraQueryBuilder):string {

    let query = this.equalsParam.reduce((acc: string, cur: Entry) => {
        return acc += ` AND ${cur.key} = ${cur.value}`;
    }, `PROJECT = "${this.project}"`)

    query = this.inParam.reduce((acc: string, cur: Entry) => {
        return acc += ` AND ${cur.key} IN ${cur.value}`;
    }, query)

    return this.operationParam.reduce((acc: string, cur: ParamOperation) => {
        return acc += ` AND ${cur.key} ${cur.operation} ${cur.value}`
    }, query)
}

const setProject = function (this: JiraQueryBuilder, project: string): JiraQueryBuilder {
    this.project = project
    return this
}

const paramEquals = function(this: JiraQueryBuilder, key: string, value: string): JiraQueryBuilder {
    this.equalsParam.push({key, value})
    return this
}

const paramIn = function(this: JiraQueryBuilder, key: string, value: string): JiraQueryBuilder {
   this.inParam.push({key, value})
    return this
}

const paramOperation = function(this: JiraQueryBuilder, key: string, operation: Operation, value: string): JiraQueryBuilder {
    this.operationParam.push({key, operation, value})
    return this
}

export class Entry {
    key: string = ''
    value: string = ''
}

export enum Operation {
    EQUALS = '=',
    NOT_EQUALS = '!=',
    GREATER = '>',
    LESS = '<',
    GREATER_OR_EQUALS = '>=',
    LESS_OR_EQUALS = '<=',
    IN = 'IN'
}

export class ParamOperation {
    key: string = ''
    value: string = ''
    operation: Operation = Operation.EQUALS
}

export const Builder = (): JiraQueryBuilder => ({
    build,
    setProject,
    paramEquals,
    paramIn,
    paramOperation, 
    project: 'GTS Digital Platform',
    equalsParam: [],
    inParam: [],
    operationParam: []
});

export interface JiraQueryBuilder {
    build(): string,
    setProject(project: string): JiraQueryBuilder,
    paramEquals(key: string, value: string): JiraQueryBuilder,
    paramIn(key: string, value: string): JiraQueryBuilder,
    paramOperation(key: string, operation: Operation, value: string): JiraQueryBuilder
    project: string,
    equalsParam: Entry[],
    inParam: Entry[],
    operationParam: ParamOperation[]
}
