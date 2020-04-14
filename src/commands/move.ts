import { Command, flags } from '@oclif/command'

import { jiraClient, JiraClient, TaskType } from '../utils/jira-client'
import { Builder, JiraQueryBuilder, Operation } from '../utils/jira-query-builder'
import JiraCommand from './jira-command'

export default class Move extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    boardIndex: flags.string({ char: 'b', required: true }),
    // componentIndex: flags.string({ char: 'c', required: false })
  }

  static args = [{ name: 'sprint', required: true }]

  async init() {

    await super.init()

    Move.description = `move issues from one sprint to another
${JiraCommand.description}`

    Move.flags = {
      ...Move.flags,
      ...JiraCommand.flags
    }
  }

  async run() {
    const { args, flags } = this.parse(Move)

    const epics: any = await jiraClient.getEpics(this.getCurrentBoardId())

    await this.move(args.sprint.split(','))
  }

  move = async (sprints: string[]) => {

    const sprintsVersion: string[] = sprints.map((sprint: string) => sprint.replace(/\D/g, ''))
    const response: any = (await jiraClient.getSprints(this.getCurrentBoardId(), true, true, false)).values
    for (let index = 0; index < response.length; index++) {

      const sprint: any = response[index]

      if (sprintsVersion.indexOf(sprint.name.replace(/\D/g, '')) === -1) {
        return
      }

      const query: string = Builder().paramEquals('sprint', sprint.id)
        .paramOperation('type', Operation.NOT_EQUALS, '"TM SubTask"')
        .paramEquals('key', 'VLBSFI_GDP_AG-3900')
        .build()

      const issues: any = await jiraClient.getIssues(this.getCurrentBoardId(), query)

      for (let i = 0; i < issues.length; i++) {

        const issue = issues[i]
        await this._moveIssue(response[1].id, issue.key)

        // const payload: any = {
        //   // update: {sprint: [{add: {id: response[1].id}}]},
        //   update: {
        //     sprints: [{
        //       add: {id: response[1].id}
        //     }]
        //   },
        //   fields: { }
        // }
        // await jiraClient.updateTask(issue.key, payload)
      }
    }
  }

  _moveIssue = async (sprintId: string, issueId: string) => {
    await jiraClient.moveToSprint(sprintId, issueId).catch((err: any) => {
    })
  }
}
