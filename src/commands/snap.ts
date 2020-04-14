import { Command, flags } from '@oclif/command'

const chalk = require('chalk')
const Table = require('cli-table')

import { people, peopleDesc, dailyWorkingHours, indexesToTGIs } from '../constants/team'
import { Builder, JiraQueryBuilder, Operation } from '../utils/jira-query-builder'
import { jiraClient, JiraClient } from '../utils/jira-client'
import JiraCommand from './jira-command';

export default class Snap extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    remaining: flags.string({ char: 'r', description: `remaining available sprint time (in hours)`, required: true }),
    work: flags.string({ char: 'w', description: `sprint name`, required: false }),
    future: flags.boolean({ char: 'f', description: `include future sprints`, required: false }),
    people: flags.string({ char: 'p', description: `assignees`, required: false }),
    boardIndex: flags.string({ char: 'b', required: true }),
    // componentIndex: flags.string({ char: 'c', required: false })
  }

  // static args = [{ name: 'file' }]
  async init() {

  await super.init()

  Snap.description = `sprint snapshot
People flag description
${peopleDesc}
${JiraCommand.description}`

Snap.flags = {
    ...Snap.flags,
    ...JiraCommand.flags
  }
}

  async run() {

    const { args, flags } = this.parse(Snap)

    await this.snap(flags)
    this._printColorSubtitle()
  }

  async snap(flags: any = {}) {

    // const response: any = flags.future ? await jiraClient.getActiveAndFutureSprints() : await jiraClient.getActiveSprints()
    const response: any = await jiraClient.getSprints(this.getCurrentBoardId(), true, flags.future || flags.work, false)
    const sprintNames: string[] = flags.work ? flags.work.split(',') : []

    await Promise.all(response.values.map(async (sprint: any) => {

      if (flags.work && sprintNames.indexOf(sprint.name) === -1) {
        return
      }

      const remainingSprintTime: number = +flags.remaining * 60 * 60

      const jiraQueryBuilder: JiraQueryBuilder = Builder().paramEquals('sprint', sprint.id)
        .paramOperation('statusCategory', Operation.NOT_EQUALS, 'Done')

      const peopleTGI: string[] = [];
      if (flags.people) {
        flags.people.split(',').forEach((index: string) => {
          peopleTGI.push(people[+index].tgi)
        })
        jiraQueryBuilder.paramIn('assignee', `(${peopleTGI.join(',')})`) 
      }

      const query: string = jiraQueryBuilder.build()

      const issues: any = await jiraClient.getIssues(this.getCurrentBoardId(), query)
      const table: any = this.generateProgressTable(sprint.name)
      const total: any = { remainingEstimate: 0, remainingSprintTime: 0, allocation: 0, off: 0 }

      await Promise.all(people.map(async (person: any) => {

        const tgi: string = person.tgi
        person.personalRemainingEstimate = 0
        person.logged = 0

        if(flags.people && peopleTGI.indexOf(person.tgi) === -1){
          return
        }

        const updatedIssues = await Promise.all(issues.map(async (issue: any) => {

          if(issue.fields.assignee)

          if (!issue.fields.assignee || !issue.fields.assignee.name ||
            issue.fields.assignee.name.toUpperCase() !== tgi.toUpperCase()) {
            return issue
          }

          if (issue.fields.timeestimate) {
            person.personalRemainingEstimate += issue.fields.timeestimate
          }

          return issue
        }))

        total.remainingEstimate += person.personalRemainingEstimate
        total.allocation += person.allocation
        total.off += person.off
        
        const personalRemainingSprintTime = Math.max(remainingSprintTime - person.off * dailyWorkingHours * 3600, 0) * person.allocation
        total.remainingSprintTime += personalRemainingSprintTime

        table.push([person.name, `${person.allocation * 100}%`, person.off, this.secondsToHours(person.personalRemainingEstimate),
        this.secondsToHours(personalRemainingSprintTime), this._colorProgressPercentage(person.personalRemainingEstimate, personalRemainingSprintTime)])
        return person
      }))


      table.push([chalk.grey('Total'), `${total.allocation * 100}%`, total.off, this.secondsToHours(total.remainingEstimate), this.secondsToHours(total.remainingSprintTime),
      this._colorProgressPercentage(total.remainingEstimate, total.remainingSprintTime)])

      console.log(table.toString())
    }))
  }

  generateProgressTable(sprint: string): any {
    return new Table({
      head: [sprint, `Allocation`, `Days Off`, 'Remaining(h)', 'Available(h)', 'Percentage'],
      colWidths: [30, 15, 15, 15, 15, 15]
    })
  }

  secondsToHours(seconds: number) {
    return (seconds / 3600).toFixed(1)
  }

  _colorProgressPercentage(spent: number, remaining: number) {

    if (remaining === 0) {
      return '0%'
    }

    const percentage = 100 * spent / remaining
    const perStr = percentage.toFixed(1) + '%'
    if (percentage > 100 || Number.isNaN(percentage)) {
      return this._high(perStr)
    } else if (percentage > 90) {
      return this._medium(perStr)
    } else if (percentage > 80) {
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
