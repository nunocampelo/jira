import { request } from 'https'
const JiraApi = require('jira-client')

const path = require('path')
import { Builder } from 'builder-pattern'

import config from '../../config/thales'
const api = new JiraApi(config.jira.client)

const jiraProjectConfig = config.jira.project
const jiraQueryConfig = config.jira.query
const storyPointsValues: number[] = [0.5,1,2,3,5]

// const jiraConfig = {
//   boardId: '13',
//   startAt: 0,
//   maxResults: 200,
//   validateQuery: true,
//   fields: null
//   // fields: "changelog,aggregatetimespent,aggregatetimeoriginalestimate,timetracking,creator,components,assignee,description,epic,issuelinks,issuetype,labels,priority,progress,status,subtasks,summary,fixVersions,customfield_9994,customfield_10002"
// }

const getIssueTypes = async () => {
  return (await api.listIssueTypes()).map((cur: any) => cur.name);
}

const getUsers = async () => {
 return (await api.getUsersInGroup('jira-users')).values
}

const getAllBoards = async () => {
  return (await api.getAllBoards()).values
}

const getFirstBoardByNameContaining = async (name: string) => {
  return (await getAllBoards()).find((cur: Board) => cur.name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
}

const fetchIssuesForBoard = async (boardId: number, jiraQuery: string): Promise<any> => {
  console.log(`Executing query ${jiraQuery}`)
  console.log(`For board with id ${boardId}`)
  return api.getIssuesForBoard(boardId, jiraQueryConfig.startAt, jiraQueryConfig.maxResults, jiraQuery, jiraQueryConfig.validateQuery, jiraQueryConfig.fields)
}

const getIssues = async (boardId: number, jiraQuery: string): Promise<any> => {

  try {

    const response: any = await fetchIssuesForBoard(boardId, jiraQuery)
    console.log(`Got ${response.issues.length} issues`)

    return response.issues

  } catch (err) {
    console.error(err)
  }
}

const getIssueWorklogs = async (issueId: string): Promise<any> => {
  return api.getIssueWorklogs(issueId)
}

const getActiveAndFutureSprints = async (boardId: number): Promise<any> => {
  return getSprints(boardId, true, true)
}

const getActiveSprints = async (boardId: number): Promise<any> => {
  return getSprints(boardId)
}

const getRapidViews = async (): Promise<any> => {
  return api.findRapidView('scopechangeburndownchart')
}

const getSprints = async (boardId: number, active: boolean = true, future: boolean = false, closed: boolean = false): Promise<any> => {

  const sprintStatus = []

  if (active) {
    sprintStatus.push('active')
  }

  if (future) {
    sprintStatus.push('future')
  }

  if (closed) {
    sprintStatus.push('closed')
  }

  return api.getAllSprints(boardId, 0, 100, sprintStatus.reduce((acc: string, cur: string) => acc + `,${cur}`, ''))
}

const addComment = (issueNumber: number, text: string): Promise<any> => {
  const issueId = `${jiraProjectConfig.name}-${issueNumber}`
  return api.addComment(issueId, text)
}

const addTask = async (request: TaskRequestCreation): Promise<any> => {
  _completeTaskRequest(request)

  const parentTask = await _createTask(request)
  return _createSubTasks(parentTask.key, request)
}

const updateTask = async (issueId: string, issue: any): Promise<any> => {
  return api.updateIssue(issueId, issue)
}

const getVersions = async (boardId: number): Promise<any> => {
  return api.getAllVersions(boardId, 0, 20, false)
}

const getComponents = async (): Promise<any> => {
  return await api.listComponents(jiraProjectConfig.name)
}

const getEpics = async (boardId: number): Promise<any> => {
  return api.getEpics(boardId, 0, 300, false)
}

const moveToEpic = async (epicId: string, issues: any[]): Promise<any> => {
  return api.moveIssuesToEpic(epicId, issues)
}

const moveToSprint = async (sprintId: string, issueId: string): Promise<any> => {
  return api.addIssueToSprint(issueId, sprintId)
}

const _createTask = (request: TaskRequestCreation) => {

  const task: any =
    {
      "fields": {
        "fixVersions": request.fixVersions ?
          request.fixVersions.map((version: string) => { return { name: version } }) : [],
        "labels": request.labels,
        "versions": request.versions ?
          request.versions.map((version: string) => { return { name: version } }) : [],
        "assignee": {
          "name": request.assignee,
        },
        "components": [
          {
            "name": request.componentName
          }
        ],
        "issuetype": {
          "name": request.type || "Story",
        },
        "parent": {
          "key": request.parentKey
        },
        "project": {
          "key": request.project || jiraProjectConfig.name
        },
        "description": request.description ? request.description.reduce((acc: string, cur: string) => acc + cur + '\n', '') : undefined,
        "customfield_10006": request.epic,
        "summary": request.summary,
        "customfield_10002": request.storyPoints,
        "timetracking": {
          "originalEstimate": request.originalEstimate,
          "remainingEstimate": request.remainingEstimate
        }
      }
    }

  if (request.assignee) {
    task.fields.assignee = {
      name: request.assignee
    }
  }

  console.log(task)

  const taskCreationPromise: Promise<any> = api.addNewIssue(task)

  taskCreationPromise.then((response: any) => {
    console.log(`Created task '${request.summary}' with key ${response.key}`)
  })

  return taskCreationPromise
}

const _createSubTasks = async (parentKey: string, parentTaskRequest: TaskRequestCreation): Promise<void> => {

  const subTasks: any[] = parentTaskRequest.subTasks

  const _createSubTask = async (parentKey: string, summary: string, description: string[],
    labels: string[], timeEstimate: number): Promise<any> => {

    const subTaskRequestCreation: TaskRequestCreation = Builder(parentTaskRequest)
      .summary(summary).labels(labels).
      type(TaskType.SubTask).parentKey(parentKey).originalEstimate(timeEstimate).remainingEstimate(timeEstimate)
      .description(description).build()

    return _createTask(subTaskRequestCreation)
  }

  for (let index = 0; index < subTasks.length; index++) {
    const subTaskDefinition = subTasks[index]
    await _createSubTask(parentKey, subTaskDefinition.summary,
      subTaskDefinition.description, subTaskDefinition.labels, subTaskDefinition.time)
  }
}

const _completeTaskRequest = async (parentTask: TaskRequestCreation) => {

  const oneHourInMinutes: number = 60
  const oneWorkDayInMinutes: number = 8 * oneHourInMinutes
  const subTasks: any[] = parentTask.subTasks || []

  if (parentTask.backendSubTasks) {

    parentTask.labels.push('SP')

    subTasks.push({
      summary: `Implement Backend - ${parentTask.summary}`,
      description: ['h2. TODO', '* Implement Backend',
        '* Generate new Resource Server release (semantic versioning) and Comment it in the Parent Task', '** Even without unit/integration testes so it can be verified',
        '* Solve the Sub-Task'
      ],
      labels: ['SP'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Test Backend - ${parentTask.summary}`,
      description: ['h2. TODO',
        '* Create/Update Unit and Integration Tests', '* Create/Update Spring REST Docs', '* Generate Release and Comment it in the Parent Task',
        '* Solve the Sub-Task'
      ],
      labels: ['SP'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Code Review Backend - ${parentTask.summary}`,
      description: ['h2. TODO', '* Code Review Backend', '* Close the Sub-Task'],
      labels: ['SP'],
      time: oneHourInMinutes
    })
  }

  if (parentTask.frontendSubTasks) {

    parentTask.labels.push('UI')

    subTasks.push({
      summary: `Implement Frontend - ${parentTask.summary}`,
      description: ['h2. TODO', '* Implement Frontend',
        '* Generate new Resource Server release (semantic versioning) and Comment it in the Parent Task', '** Even without unit/integration testes so it can be verified',
        '* Solve the Sub-Task'],
      labels: ['UI'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Test Frontend - ${parentTask.summary}`,
      description: ['h2. TODO',
        '* Create/Update Unit Tests', '* Create/Update Demo', '* Generate Release and Comment it in the Parent Task',
        '* Solve the Sub-Task'],
      labels: ['UI'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Code Review Frontend - ${parentTask.summary}`,
      description: ['h2. TODO', '* Code Review Frontend', '* Close the Sub-Task'],
      labels: ['UI'],
      time: oneHourInMinutes
    })
  }

  if (parentTask.stdTestsSubTasks) {

    parentTask.labels!.push('QA')

    subTasks.push({
      summary: `Specify STD Tests - ${parentTask.summary}`,
      description: ['h2. TODO', '* Write Tests', '* Solve the Sub-Task'],
      labels: ['QA'],
      time: oneWorkDayInMinutes
    })
  }

  if (parentTask.requirementSubTasks) {

    parentTask.labels!.push('QA')

    subTasks.push({
      summary: `Specify Requirements - ${parentTask.summary}`,
      description: ['h2. TODO', '* Specify Requirements', '* Send to Doors', '* Solve the Sub-Task'],
      labels: ['QA'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Review Requirements - ${parentTask.summary}`,
      description: ['h2. TODO', '* Review Requirements', '* Close the Requirement Specification Sub-Tasks'],
      labels: ['QA'],
      time: 2 * oneHourInMinutes
    })
  }

  if (parentTask.automationSubTasks) {

    parentTask.labels!.push('QA')

    subTasks.push({
      summary: `Implement UATs - ${parentTask.summary}`,
      description: ['h2. TODO', '* Implement UATs', '* Solve the Sub-Task'],
      labels: ['QA'],
      time: oneWorkDayInMinutes
    })

    subTasks.push({
      summary: `Code Review UATs - ${parentTask.summary}`,
      description: ['h2. TODO', '* Code Review UATs', '* Close the Sub-Task'],
      labels: ['QA'],
      time: oneHourInMinutes
    })
  }

  if (subTasks.length > 0) {
    subTasks.push({
      summary: `Verify Task - ${parentTask.summary}`,
      description: ['h2. TODO', '* Functionaly Verify Task Implementation', '* Close all Sub-Tasks', '* Verify the Parent Task'],
      labels: ['QA'],
      time: 4 * oneHourInMinutes
    })
  }

  const taskRequestNotHasStoryPoints: boolean = parentTask.storyPoints === -1

  if (taskRequestNotHasStoryPoints) {
    parentTask.storyPoints = 0

    const totalSubTasksTime: number = subTasks.reduce((acc: number, subTask: any) => acc + subTask.time / oneWorkDayInMinutes, 0)

    parentTask.storyPoints = storyPointsValues.reduce((sp: number, cur: number) => {
      if (cur >= totalSubTasksTime && sp === 0) {
        return cur
      } else {
        return sp
      }
    }, 0)
  }

  parentTask.subTasks = subTasks
}

// export enum TaskType {
//   Story, SubTask = 'TM SubTask', Task = 'TM Task',
// }

export interface Component {
  id: number
  self: string
  name: string
}

export interface Board {
  id: number
  self: string
  name: string
  type: string
}

export enum TaskType {
  Story, SubTask = 'TM SubTask',
  Task = 'TM Task', 
  ProblemReport = 'Problem Report'
}

export enum Severity {
  Blocking, Major, Minor
}

export interface SubTaskRequestCreation extends TaskRequestCreation {
  type: TaskType,
  parentKey: string
}

export interface TaskRequestCreation {
  summary: string
  labels: string[]
  key?: string
  description?: string[]
  storyPoints?: number
  epic?: string
  componentName?: string
  assignee?: string
  fixVersions?: string[]
  versions?: string[]
  type?: TaskType
  project?: string
  parentKey?: string
  originalEstimate?: number
  remainingEstimate?: number
  backendSubTasks: boolean
  frontendSubTasks: boolean
  stdTestsSubTasks: boolean
  requirementSubTasks: boolean
  automationSubTasks: boolean
  subTasks: any[]
}

export const jiraClient: JiraClient = {
  fetchIssuesForBoard,
  getIssues,
  getIssueWorklogs,
  getSprints,
  getActiveAndFutureSprints,
  getActiveSprints,
  addComment,
  addTask,
  getRapidViews,
  updateTask,
  getVersions,
  getComponents,
  moveToEpic,
  getEpics,
  moveToSprint,
  getAllBoards,
  getFirstBoardByNameContaining,
  getUsers,
  getIssueTypes
}

export interface JiraClient {
  fetchIssuesForBoard(boardId: number, jiraQuery: string): Promise<any>
  getIssues(boardId: number, jiraQuery: string): Promise<any>
  getIssueWorklogs(issueId: string): Promise<any>
  getSprints(boardId: number, active: boolean, future: boolean, closed: boolean): Promise<any>
  getActiveAndFutureSprints(boardId: number): Promise<any>
  getActiveSprints(boardId: number): Promise<any>
  addComment(issueNumber: number, text: string): Promise<any>
  addTask(task: any): Promise<any>
  getRapidViews(): Promise<any>
  updateTask(issueId: string, issue: any): Promise<any>
  getVersions(boardId: number): Promise<any>
  getComponents(): Promise<Component[]>
  getEpics(boardId: number): Promise<any>
  moveToEpic(epicId: string, issues: any[]): Promise<any>
  moveToSprint(sprintId: string, issueId: string): Promise<any>
  getAllBoards(): Promise<Board[]>
  getFirstBoardByNameContaining(name: string): Promise<Board>
  getUsers(): Promise<any>
  getIssueTypes(): Promise<string[]>
}