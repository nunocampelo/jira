import { Command, flags } from '@oclif/command'

const path = require('path')
import { jiraClient, JiraClient, Board, Component } from '../utils/jira/jira-client'
import config from '../config/thales'

const excludedComponentsNames: string[] = config.components.exclude

export interface Feature {
    data: any[],
    flag: any,
    description: string
}

export default abstract class JiraCommand extends Command {

    boards: Feature = {
        data: [],
        flag: '',
        description: '' 
    };
    components: Feature = {
        data: [],
        flag: '',
        description: '' 
    };
    people: Feature = {
        data: [],
        flag: '',
        description: '' 
    };

    issueTypes: Feature = {
        data: [],
        flag: '',
        description: ''
    }

    async init() {

        super.init()
        await this._initData()
    }

    _initData = async () => {

        const results: any[] = await Promise.all([jiraClient.getAllBoards(), jiraClient.getComponents(), jiraClient.getIssueTypes()])

        const boardData: Board[] = results[0] 
        const componentsData: any[] = results[1]
        const peopleData: any[] = config.team.people
        const issueTypesData: string[] = results[2]

        console.log('types', issueTypesData)
        
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
            flag: flags.string({ char: 'b', description: `board index`, options: Object.keys(boardData), default: defaultBoardIndex }),
            description: `Boards Index:
${boardData.map((cur: Board, index: number) => `${index} => ${cur.name}\n`)}`
        }

        this.components = {
            data: componentsData,
            flag: flags.string({ char: 'c', description: `components index`, options: Object.keys(componentsData) }),
            description: `Components:
${componentsData.map((cur: Component, index: number) => `${index} => ${cur.name}\n`)}`
        }

        this.people = {
            data: peopleData,
            flag: flags.string({ char: 'b', description: `board index`, options: peopleData.map((cur: any) => cur.tgi), default: peopleData[0].tgi}), 
            description: `People:
${peopleData.map((cur: any, index: number) => `${cur.tgi} => ${cur.name}\n`)}`
        }

        this.issueTypes = {
            data: issueTypesData,
            flag: flags.string({ char: 't', description: `story types index`, options: Object.keys(issueTypesData), default: '0'}),
            description: `Issue types:
${issueTypesData.map((cur: any, index: number) => `${index} => ${cur}\n`)}`
        }
    }
}
