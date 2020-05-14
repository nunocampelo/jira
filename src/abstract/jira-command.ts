import { Command, flags } from '@oclif/command'

const path = require('path')
import { jiraClient, JiraClient, Board, Component } from '../jira/jira-client'
import config from '../config/thales'

const excludedComponentsNames: string[] = config.components.exclude

export interface Feature {
    data: any[],
    // flag: any,
    description: string
}

export default abstract class JiraCommand extends Command {

    boards: Feature = {
        data: [],
        description: '' 
    }
    components: Feature = {
        data: [],
        description: '' 
    }
    people: Feature = {
        data: [],
        description: '' 
    }
    issueTypes: Feature = {
        data: [],
        description: ''
    }
    issueStatus: Feature  = {
        data: [],
        description: ''
    }
    priorities: Feature = {
        data: [],
        description: ''
    }
    versions: Feature = {
        data: [],
        description: ''
    }

    async init() {
        super.init()
        await this._initData()
    }

    _initData = async () => {

        const results: any[] = await Promise.all([jiraClient.getAllBoards(), jiraClient.getComponents(), jiraClient.getIssueTypes(), jiraClient.getPriorities(), jiraClient.getIssuesStatus(), jiraClient.getVersions()])

        const boardData: Board[] = results[0] 
        const componentsData: any[] = results[1]
        const peopleData: any[] = config.team.people
        const issueTypesData: string[] = results[2]
        const prioritiesData: string[] = results[3]
        const issueStatusData: string[] = results[4]
        const versionsData: string[] = results[5]

        const defaultBoardIndex: string = boardData.reduce((acc: string, cur: Board, index: number) => {

            if (!acc) {

                if (cur.name.toLowerCase().indexOf('team a') !== -1) {
                    acc += index
                }
            }

            return acc
        }, '')

        this.boards = {
            data: boardData,
            description: `Boards Index:
${boardData.map((cur: Board, index: number) => `${index} => ${cur.name}\n`)}`
        }

        this.components = {
            data: componentsData,
            description: `Components:
${componentsData.map((cur: Component, index: number) => `${index} => ${cur.name}\n`)}`
        }

        this.people = {
            data: peopleData,
            description: `People:
${peopleData.map((cur: any, index: number) => `${index} => ${cur.name}\n`)}`
        }

        this.issueTypes = {
            data: issueTypesData,
            description: `Issue types:
${issueTypesData.map((cur: string, index: number) => `${index} => ${cur}\n`)}`
        }

        this.issueStatus = {
            data: issueStatusData,
            description: `Issue status:
${issueStatusData.map((cur: string, index: number) => `${index} => ${cur}\n`)}`
        }

        this.priorities = {
            data: prioritiesData,
            description: `Priorities:
${prioritiesData.map((cur: string, index: number) => `${index} => ${cur}\n`)}`
        }

        this.versions = {
            data: versionsData,
            description: `Versions:
${versionsData.map((cur: string, index: number) => `${cur}\n`)}`
        }
    }

    getNamesByIndexes = (data: any[], delimiter: string, indexesStr: string): string => {

        const indexes: string[] = indexesStr.split(delimiter) 
        const names: string[] = indexes.map((cur: string) => data[+cur])

        return names.join(delimiter)
    }
}
