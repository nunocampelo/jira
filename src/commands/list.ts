import { Command, flags } from '@oclif/command'

const chalk = require('chalk')
const Table = require('cli-table')

import config from '../config/thales'
import { Logger, createLogger } from '@jsincubator/core'
// import { people, peopleDesc, indexesToTGIs } from '../constants/team'
// import { status, statusDesc } from '../constants/jira'
import { Builder, JiraQueryBuilder, Operation } from '../jira/jira-query-builder'
import { jiraClient, JiraClient, Board } from '../jira/jira-client'
import JiraCommand from '../abstract/jira-command'

const logger: Logger = createLogger(`jira.commands.list`)

export default class List extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    people: flags.string({ char: 'p', description: `assignee`, required: false }),
    // status: flags.string({ char: 's', description: `task status`, required: false, options: Object.keys(status) }),
    openSprints: flags.boolean({ char: 'o', description: `only open sprints`, required: false }),
    // work: flags.string({ char: 'w', description: `sprint name`, required: false }),
    boardIndex: flags.string({ char: 'b', required: true })
  }

  async init() {

    await super.init()

    List.description = `search for issues by filters
    
${this.boards.description}`
    // People flag description
    // ${peopleDesc}
    // Status flag description
    // ${statusDesc}
    // ${JiraCommand.description}`

    // List.flags = {
    //   ...List.flags,
    //   ...JiraCommand.flags
    // }
  }

  async run() {
    const { args, flags } = this.parse(List)
    await this.list(flags)
    this._printColorSubtitle()
  }

  async list(flags: any = {}) {

    const jiraQueryBuilder: JiraQueryBuilder = Builder()

    if (flags.people) {
      // const peopleTGI: string[] = indexesToTGIs(flags.people.split(','))
      // jiraQueryBuilder.paramIn('assignee', `(${peopleTGI.join(',')})`)
      const peopleIndexes: string[] = flags.people.split(',')
      const peopleTGIs: string[] = peopleIndexes.map((cur: string) => config.team.people[+cur].tgi)
      jiraQueryBuilder.paramIn('assignee', `(${peopleTGIs.join(',')})`)
    }

    if (flags.status) {
      jiraQueryBuilder.paramEquals('status', status[+flags.status])
    }

    if (flags.work) {
      jiraQueryBuilder.paramIn('sprint', `("${flags.work}")`)
    }

    if (flags.openSprints) {
      jiraQueryBuilder.paramIn('sprint', 'openSprints()')
    }

    const boardId: number = this.boards.data[flags.boardIndex].id
    const jiraQuery: string = jiraQueryBuilder.build()

    const table: any = await this.getIssuesTable(boardId, jiraQuery)
    console.log(table.toString())
  }

  async getIssuesTable(boardId: number, jiraQuery: string): Promise<any> {

    // try {

    const response: any = await jiraClient.fetchIssuesForBoard(boardId, jiraQuery)

    if (response.error) {
      logger.error(`error getting issues:%s`, response.error.message)
    } else {
      logger.info(`got %d issues`, response.issues.length)
    }

    // console.log(response.issues.filter((cur: any) => cur.key === 'VLBSFI_GDP_AG-7074')[0].fields.priority)
    return this.issuesToTable(response.issues)

    // } catch (err) {
    //   console.error(err)
    // }
  }

  issuesToTable(issues: any): any {

    const table: any = this.generateTable()

    issues.forEach((issue: any) => {

      const fields = issue.fields
      const componentNames = fields.components.reduce((acc: any, cur: any, index: number) =>
        index === fields.components.length - 1 ? acc + `${cur.name}` : acc + `${cur.name}, `, '')

      const fixVersions = fields.fixVersions.reduce((acc: any, cur: any, index: number) =>
        index === fields.fixVersions.length - 1 ? acc + `${cur.name}` : acc + `${cur.name}, `, '')

      const severity = fields.customfield_9994 ? fields.customfield_9994.value : ''

      const assignee = fields.assignee ? fields.assignee.displayName : ''

      table.push([issue.key, fields.summary, componentNames, fields.issuetype.name, severity,
        fixVersions, fields.status.name, assignee, fields.customfield_10002 || '', this.secondsToHours(fields.aggregatetimeestimate),
      this._colorTimePercentage(fields.status.name, fields.aggregatetimespent, fields.aggregatetimeoriginalestimate)])
    })

    return table
  }

  generateTable(): any {
    return new Table({
      head: ['Key', 'Summary', 'Components', 'Type', 'Severity', 'Version', 'Status', 'Assignee', 'SP', 'Remaining(h)', 'Spent'],
      colWidths: [20, 70, 25, 18, 10, 10, 15, 20, 5, 15, 10]
    });
  }

  secondsToHours(seconds: number) {
    return (seconds / 3600).toFixed(1)
  }

  _colorTimePercentage(status: string, spent: number, estimate: number) {

    if (!estimate) {
      return this._medium('NaN')
    }

    const percentage = 100 * spent / estimate
    const perStr = percentage.toFixed(1) + '%'

    if (status === 'Verified' || status === 'Closed') {
      if (percentage === 0 || percentage > 150) {
        return this._medium(perStr)
      }
    } else if (status !== 'Solved' && percentage >= 100) {
      return this._high(perStr)
    }

    if (status === 'Solved' && (percentage === 0 || percentage >= 100)) {
      return this._medium(perStr)
    }

    if (status === 'StartedWork' && percentage === 0) {
      return this._low(perStr)
    }

    return perStr
  }

  _low(str: string): string {
    return chalk.bgYellow(str)
  }

  _medium(str: string): string {
    return chalk.bgYellowBright(str)
  }

  _high(str: string): string {
    return chalk.bgRedBright(str)
  }

  _printColorSubtitle() {
    console.log(`Color Severity Subtitle: ${this._low('LOW')} ${this._medium('MEDIUM')} ${this._high('HIGH')}`)
  }
}
