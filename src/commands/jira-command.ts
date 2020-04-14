import { Command, flags } from '@oclif/command'

const path = require('path')
import { jiraClient, JiraClient, Board, Component } from '../utils/jira-client'
import { envLoader, configLoader } from '@jsincubator/core'

envLoader.load(path.resolve(`${__dirname}/../../.env`))
const excludedComponentsNames: string[] = configLoader.load('components.exclude')

export default abstract class JiraCommand extends Command {

    static description: string
    static flags = {
        boardIndex: flags.string({ char: 'b', required: true }),
        // componentIndex: flags.string({ char: 'c', required: false })
    }

    boards: Board[] = []
    components: any[] = []

    async init() {

        super.init()
        await this._fetchData()
        await this._complementFlags()
        await this._complementDescription()
    }

    getCurrentBoard = (): Board => this.boards[+JiraCommand.flags.boardIndex]

    getCurrentBoardId = () => this.getCurrentBoard().id

    _fetchData = async () => {
        const results: any[] = await Promise.all([jiraClient.getAllBoards(), jiraClient.getComponents()])
        this.boards = results[0]
        this.components = results[1].filter((cur: Component) => excludedComponentsNames.indexOf(cur.name) === -1)

    }

    _complementFlags = async () => {

        const defaultBoardIndex: string = this.boards.reduce((acc: string, cur: Board, index: number) => {

            if (!acc) {

                if (cur.name.toLowerCase().indexOf('team a') !== -1) {
                    acc += index
                }
            }

            return acc
        }, '')

        JiraCommand.flags.boardIndex = flags.string({ char: 'b', description: `board index`, options: Object.keys(this.boards), default: defaultBoardIndex })
        // JiraCommand.flags.componentIndex = flags.string({ char: 'c', description: `components index`, options: Object.keys(this.components) })
    }

    _complementDescription = async () => {

        JiraCommand.description = `Boards
${this.boards.map((cur: Board, index: number) => `${index} => ${cur.name}\n`)}`

        JiraCommand.description += `Components
${this.components.map((cur: Component, index: number) => `${cur.name}\n`)}`

    }
}
