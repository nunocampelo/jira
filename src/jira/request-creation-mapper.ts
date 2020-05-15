import { TaskRequestCreation } from './jira-client'
import { plainToClass, classToPlain } from 'class-transformer'

export const test = () => {
    
    const result: TaskRequestCreation = plainToClass(TaskRequestCreation, {
        summary: 'summary',
        project: 'project',
        type: 'type',
        not: 'not',
        epic: 'epic',
        labels: ['one', 'two']
    }, { excludeExtraneousValues: true  })


    console.log('task', result)
   
    
    const json: any = classToPlain(result)


    console.log('json', json)
}

export const fromCliFlags = (flags: any, delimiter: string = ','): TaskRequestCreation => {

    const request: TaskRequestCreation = {
        summary: flags.summary,
        type: flags.type,
        project: flags.project
    }

    if (flags.epic) {
        request.epic = flags.epic
    }

    if (flags.versions) {
        request.versions = flags.versions.split(delimiter)
    }

    if (flags.fixVersions) {
        request.fixVersions = flags.fixVersions.split(delimiter)
    }

    if (flags.labels) {
        request.labels = flags.labels.split(delimiter)
    }

    if (flags.assignee) {
        request.assignee = flags.assignee
    }

    if (flags.storyPoints) {
        request.storyPoints = +flags.storyPoints
    }

    if (flags.components) {
        request.components = flags.components.split(delimiter)
    }

    if (flags.description) {
        request.description = flags.description.split('\\n')
    }

    if (flags.priority) {
        request.priority = flags.priority
    }

    return request
}

export const fromCsvRow = (row: any, delimiter: string = ','): TaskRequestCreation => {

    const request: TaskRequestCreation = {
        summary: row.summary,
        type: row.type,
        project: row.project
    }

    if (row.epic) {
        request.epic = row.epic
    }

    if (row.versions) {
        request.versions = row.versions.split(delimiter)
    }

    if (row.fixVersions) {
        request.fixVersions = row.fixVersions.split(delimiter)
    }

    if (row.labels) {
        request.labels = row.labels.split(delimiter)
    }

    if (row.assignee) {
        request.assignee = row.assignee
    }

    if (row.storyPoints) {
        request.storyPoints = +row.storyPoints
    }

    if (row.components) {
        request.components = row.components.split(delimiter)
    }

    if (row.description) {
        request.description = row.description.split('\\n')
    }

    if (row.testRepositoryPath) {
        request.testRepositoryPath = row.testRepositoryPath
    }

    if (row.priority) {
        request.priority = row.priority
    }

    return request
}

export const toApiJson = (request: TaskRequestCreation): any => {

    const task: any = {
        fields: {
            issuetype: {
                name: request.type,
            },
            summary: request.summary
        }
    }

    if (request.fixVersions) {
        task.fields.fixVersions = request.fixVersions.map((version: string) => { return { name: version } })
    }

    if (request.versions) {
        task.fields.versions = request.versions.map((version: string) => { return { name: version } })
    }

    if (request.assignee) {
        task.fields.assignee = {
            name: request.assignee,
        }
    }

    if (request.components) {
        task.fields.components = request.components.map((cur: string) => {
            return {
                name: cur
            }
        })
    }

    if (request.type) {
        task.fields.issuetype = {
            name: request.type || 'Story',
        }
    }

    if (request.labels) {
        task.fields.labels = request.labels
    }

    // if (request.parentKey) {
    //     task.fields.parent = {
    //         key: request.parentKey
    //     }
    // }

    task.fields.project = {
        key: request.project
    }

    if (request.description) {
        task.fields.description = request.description.reduce((acc: string, cur: string) => acc + cur + '\n', '')
    }

    if (request.epic) {
        task.fields.customfield_10006 = request.epic
    }

    if (request.storyPoints) {
        task.fields.customfield_10002 = request.storyPoints
    }

    // if (request.originalEstimate || request.remainingEstimate) {
    //     task.fields.timetracking = {}
    // }

    // if (request.originalEstimate) {
    //     task.fields.timetracking.originalEstimate = request.originalEstimate
    // }

    // if (request.remainingEstimate) {
    //     task.fields.timetracking.remainingEstimate = request.remainingEstimate
    // }

    if (request.priority) {
        task.fields.priority = {
            name: request.priority
        }
    }

    if (request.testRepositoryPath) {
        task.fields.customfield_10611 = request.testRepositoryPath
    }

    return task
}