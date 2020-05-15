import { Expose, Exclude, Transform } from 'class-transformer'
import { request } from 'https'
const path = require('path')
import { Builder } from 'builder-pattern'
import config from '../config/thales'

import * as JiraApi from 'jira-client'
import { Logger, createLogger } from '@jsincubator/core'
import { ok, err, Result } from 'neverthrow'
import * as requestCreationMapper from '../jira/request-creation-mapper'

const logger: Logger = createLogger(`jira.client`)
const api = new JiraApi(config.jira.client)

const jiraProjectConfig = config.jira.project
const jiraQueryConfig = config.jira.query
const storyPointsValues: number[] = [0.5, 1, 2, 3, 5]

// const jiraConfig = {
//   boardId: '13',
//   startAt: 0,
//   maxResults: 200,
//   validateQuery: true,
//   fields: null
//   // fields: "changelog,aggregatetimespent,aggregatetimeoriginalestimate,timetracking,creator,components,assignee,description,epic,issuelinks,issuetype,labels,priority,progress,status,subtasks,summary,fixVersions,customfield_9994,customfield_10002"
// }

const getVersions = async () => {
  return (await api.getVersions(jiraProjectConfig.name)).map((cur: any) => cur.name)
}

const getPriorities = async () => {
  return (await api.listPriorities()).map((cur: any) => cur.name)
}

const getIssuesStatus = async () => {
  return (await api.listStatus()).map((cur: any) => cur.name)
}

const getIssueTypes = async () => {
  return (await api.listIssueTypes()).map((cur: any) => cur.name)
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

const fetchIssuesForBoard = async (boardId: string, jiraQuery: string): Promise<Result<any, Error>> => {
  logger.info(`executing query %s for board %s`, jiraQuery, boardId)

  try {

    return ok(await api.getIssuesForBoard(boardId, jiraQueryConfig.startAt, jiraQueryConfig.maxResults, jiraQuery, jiraQueryConfig.validateQuery, jiraQueryConfig.fields))

  } catch (error) {

    return err(error)
  }
}

const getIssues = async (boardId: string, jiraQuery: string): Promise<Result<any, Error>> => {

  try {

    const response: any = await fetchIssuesForBoard(boardId, jiraQuery)
    logger.info(`got %d issues`, response.issues.length)

    return ok(response)

  } catch (error) {

    logger.error(error)
    return err(error)
  }
}

const getIssueWorklogs = async (issueId: string): Promise<any> => {
  return api.getIssueWorklogs(issueId)
}

const getActiveSprints = async (boardId: string): Promise<any> => {
  return getSprints(boardId)
}

const getRapidViews = async (): Promise<any> => {
  return api.findRapidView('scopechangeburndownchart')
}

const getSprints = async (boardId: string, status?: 'future' | 'active' | 'closed'): Promise<any> => {
  return api.getAllSprints(boardId, 0, 100, status)
}

const addComment = (issueNumber: number, text: string): Promise<any> => {
  const issueId = `${jiraProjectConfig.name}-${issueNumber}`
  return api.addComment(issueId, text)
}

const addTask = async (request: TaskRequestCreation): Promise<Result<any, Error>> => {
  return _createTask(request)
}

const updateTask = async (issueId: string, issue: any): Promise<any> => {
  return api.updateIssue(issueId, issue)
}

const getComponents = async (): Promise<any> => {
  return (await api.listComponents(jiraProjectConfig.name)).map((cur: any) => cur.name)
}

const getEpics = async (boardId: string): Promise<any> => {
  return api.getEpics(boardId, 0, 300, 'false')
}

const moveToSprint = async (sprintId: string, issueId: string): Promise<any> => {
  return api.addIssueToSprint(issueId, sprintId)
}

const _createTask = async (request: TaskRequestCreation): Promise<Result<any, Error>> => {

  // logger.debug(`request creation %s`, request)
  const task: any = requestCreationMapper.toApiJson(request)
  logger.debug(`api json %s`, task)

  try {

    const response: any = await api.addNewIssue(task)
    logger.info(`created task '%s' with key %s`, request.summary, response.key)
    return ok(response.key)

  } catch (error) {

    logger.error(`error creating task %s: %s`, request.summary, error)
    return err(error)
  }
}

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

export enum Severity {
  Blocking, Major, Minor
}

@Exclude()
export class TaskRequestCreation {
  @Expose() summary: string
  @Expose() type: string
  @Expose() project: string
  @Expose() labels?: string[]
  @Expose() description?: string[]
  @Expose() storyPoints?: number
 
  @Expose({toClassOnly: true})
  @Expose({name: 'custom', toPlainOnly: true}) 
  // @Transform((value: s) => value, { toPlainOnly: true })
  epic?: string
  
  @Expose() components?: string[]
  @Expose() assignee?: string
  @Expose() fixVersions?: string[]
  @Expose() versions?: string[]
  @Expose() priority?: string
  @Expose() testRepositoryPath?: string

  constructor(project: string, summary: string, type: string) {
    this.project = project
    this.summary = summary
    this.type = type
  }

}

export const jiraClient: JiraClient = {
  fetchIssuesForBoard,
  getIssues,
  getIssueWorklogs,
  getSprints,
  getActiveSprints,
  addComment,
  addTask,
  getRapidViews,
  updateTask,
  getVersions,
  getComponents,
  getEpics,
  moveToSprint,
  getAllBoards,
  getFirstBoardByNameContaining,
  getUsers,
  getIssueTypes,
  getPriorities,
  getIssuesStatus
}

export interface JiraClient {
  fetchIssuesForBoard(boardId: string, jiraQuery: string): Promise<Result<any, Error>>
  getIssues(boardId: string, jiraQuery: string): Promise<Result<any, Error>>
  getIssueWorklogs(issueId: string): Promise<any>
  getSprints(boardId: string, status?: string): Promise<any>
  getActiveSprints(boardId: string): Promise<any>
  addComment(issueNumber: number, text: string): Promise<any>
  addTask(task: any): Promise<Result<any, Error>>
  getRapidViews(): Promise<any>
  updateTask(issueId: string, issue: any): Promise<any>
  getVersions(): Promise<any>
  getComponents(): Promise<Component[]>
  getEpics(boardId: string): Promise<any>
  moveToSprint(sprintId: string, issueId: string): Promise<any>
  getAllBoards(): Promise<Board[]>
  getFirstBoardByNameContaining(name: string): Promise<Board>
  getUsers(): Promise<any>
  getIssueTypes(): Promise<string[]>
  getPriorities(): Promise<string[]>
  getIssuesStatus(): Promise<string[]>
}