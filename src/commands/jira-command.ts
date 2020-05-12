import { Command, flags } from '@oclif/command'

const path = require('path')
import { jiraClient, JiraClient, Board, Component } from '../utils/jira-client'
import { envLoader, configLoader } from '@jsincubator/core'

envLoader.load(path.resolve(`${__dirname}/../../.env`))
const excludedComponentsNames: string[] = configLoader.load('components.exclude')

export interface Boards {
    data: Board[],
    flag: any,
    description: string
}

export interface Components {
    data: any[],
    flag: any,
    description: string
}

export default abstract class JiraCommand extends Command {

    // data: any = {
    //     components: '',
    //     boards: ''
    // }
    // static description: string
    // static componentsDescription: string
    // static boardDescription: string

    // static flags = {
    //     boardIndex: flags.string({ char: 'b', required: true }),
    //     // componentIndex: flags.string({ char: 'c', required: false })
    // }


    boards: Boards;
    components: Components;

    async init() {

        super.init()
        await this._initData()

        // await this._complementFlags()
        // await this._complementDescription()
    }

    // getCurrentBoard = (): Board => this.boards[+JiraCommand.flags.boardIndex]
    // getCurrentBoardId = () => this.getCurrentBoard().id

    _initData = async () => {

        const results: any[] = await Promise.all([jiraClient.getAllBoards(), jiraClient.getComponents()])

        const boardData: Board[] = results[0] 
        const componentsData: any[] = results[1]
        
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
${componentsData.map((cur: Component, index: number) => `${cur.name}\n`)}`
        }
        // this.components = results[1].filter((cur: Component) => excludedComponentsNames.indexOf(cur.name) === -1)
    }

    // _complementFlags = async () => {

    //     // const defaultBoardIndex: string = this.boards.reduce((acc: string, cur: Board, index: number) => {

    //     //     if (!acc) {

    //     //         if (cur.name.toLowerCase().indexOf('team a') !== -1) {
    //     //             acc += index
    //     //         }
    //     //     }

    //     //     return acc
    //     // }, '')

    //     // JiraCommand.flags.boardIndex = flags.string({ char: 'b', description: `board index`, options: Object.keys(this.boards), default: defaultBoardIndex })
    //     // JiraCommand.flags.componentIndex = flags.string({ char: 'c', description: `components index`, options: Object.keys(this.components) })
    // }

//     _complementDescription = async () => {

// //         JiraCommand.boardDescription = `Boards Index:
// // ${this.boards.map((cur: Board, index: number) => `${index} => ${cur.name}\n`)}`

// //         JiraCommand.componentsDescription += `Components:
// // ${this.components.map((cur: Component, index: number) => `${cur.name}\n`)}`

//     }
}
