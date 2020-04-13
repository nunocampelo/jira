import { Command, flags } from '@oclif/command'


import { jiraClient, JiraClient, Board } from '../utils/jira-client'

export default abstract class JiraCommand extends Command {

    static description: string
    static flags = {
        boardIndex: flags.string({ char: 'b' , required: true})
    }

    boards: Board[] = []

    async init() {
        super.init()

        this.boards = await jiraClient.getAllBoards()
        const defaultBoardIndex: string = this.boards.reduce((acc: string, cur: Board, index: number) => {

            if (!acc) {

                if (cur.name.toLowerCase().indexOf('team a') !== -1) {
                    acc += index
                }
            }

            return acc
        }, '')
        
        JiraCommand.flags.boardIndex = flags.string({ char: 'b', description: `board index`, options: Object.keys(this.boards), default: defaultBoardIndex })
        JiraCommand.description = `Boards
${this.boards.map((cur: Board, index: number) => `${index} => ${cur.name}\n`)}`

    }

    getCurrentBoard = (): Board => this.boards[+JiraCommand.flags.boardIndex]
    getCurrentBoardId = () => this.getCurrentBoard().id

}
