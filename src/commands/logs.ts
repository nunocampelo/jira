import { Command, flags } from '@oclif/command'
const chalk = require('chalk')
const Table = require('cli-table')

import { status, statusDesc } from '../constants/jira'
import { people, peopleDesc, indexesToTGIs } from '../constants/team'
import { Builder, JiraQueryBuilder, Operation } from '../utils/jira-query-builder'
import { jiraClient, JiraClient } from '../utils/jira-client'
import JiraCommand from './jira-command'

export default class Logs extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    begin: flags.string({ char: 'b', description: `number of days ago to begin (max 6 days)`, required: true, default: '6' }),
    people: flags.string({ char: 'p', description: `assignees`, required: false }),
    status: flags.string({ char: 's', description: `task status`, required: false, options: Object.keys(status) }),
    weekend: flags.boolean({ char: 'w', description: `include weekend days`, required: false }),
    boardIndex: flags.string({ char: 'b', required: true })
  }

  static args = [{ name: 'file' }]

  async init() {

    await super.init()

    Logs.description = `logged team hours
People flag description
${peopleDesc}
Status flag description
${statusDesc}
${JiraCommand.description}`

    Logs.flags = {
      ...Logs.flags,
      ...JiraCommand.flags
    }
  }

  async run() {

    const { args, flags } = this.parse(Logs)

    await this.logs(flags)
    this._printColorSubtitle()
  }

  async logs(flags: any = {}) {

    const jiraQueryBuilder: JiraQueryBuilder = Builder()

    const peopleTGI: string[] = [];
    if (flags.people) {
      flags.people.split(',').forEach((index: string) => {
        peopleTGI.push(people[+index].tgi)
      })
      // jiraQueryBuilder.paramIn('assignee', `(${peopleTGI.join(',')})`) 
    }

    if (flags.status) {
      jiraQueryBuilder.paramEquals('status', status[0])
    }

    const beginIndex: number = +flags.begin

    // if (!flags.all) {
    //   jiraQueryBuilder.paramIn('sprint', 'openSprints()')
    // }

    jiraQueryBuilder.paramOperation('worklogDate', Operation.GREATER_OR_EQUALS, `"${this.formatDate(this.getLastWeekDate())}"`);

    const issues = await jiraClient.getIssues(this.getCurrentBoardId(), jiraQueryBuilder.build())
    let worklogs: any[] = []

    await Promise.all(issues.map(async (issue: any) => {

      const response = await jiraClient.getIssueWorklogs(issue.key)
      worklogs = worklogs.concat(response.worklogs)
    }));

    let totalHours: any[] = []
    const result: any[] = []

    const numberDaysBegin: number[] = new Array()
    for (let index = 0; index <= beginIndex; index++) {
      numberDaysBegin[index] = beginIndex - index
    }

    const daysHeaders: string[] = []

    const days = numberDaysBegin.reduce((acc: string[], cur: number, index: number) => {

      const date: Date = new Date()
      date.setDate(date.getDate() - cur)

      const begin: Date = new Date()
      begin.setDate(begin.getDate() - beginIndex)

      if (date < begin) {
        return acc
      }

      const day = date.getDay()

      // if ((day !== 6 && day !== 0) || flags.weekend) {
      //   acc.push(this.formatDate(date))
      //   totalHours.push(0)
      // }

      const formatedDate: string = this.formatDate(date)
      if (day !== 6 && day !== 0) {
        acc.push(formatedDate)
        totalHours.push(0)
        daysHeaders.push(formatedDate)
      } else if (flags.weekend) {
        acc.push(formatedDate)
        daysHeaders.push(chalk.yellow(formatedDate))
        totalHours.push(0)
      }

      return acc
    }, [])

    let table: any = this.generateLogTable(['Logged Work'].concat(daysHeaders))

    people.forEach((person: any) => {

      const tgi = person.tgi
      const result: any = [person.name]

      if (flags.people && peopleTGI.indexOf(tgi) === -1) {
        return
      }

      const weekHours = days.map((day: string, index: number) => {

        const dailyHours: number = worklogs.reduce((acc: number, log: any) => {

          if (log.author.name.toUpperCase() === tgi && this.formatDateStr(log.started) === day) {
            acc += log.timeSpentSeconds / 3600
          }

          return acc
        }, 0)

        totalHours[index] += dailyHours

        return this._colorLogHours(dailyHours)
      })

      table.push(result.concat(weekHours))
    })

    totalHours = totalHours.map((el: any) => el.toFixed(0))
    totalHours.unshift(chalk.grey('Total'))

    table.push(totalHours)
    console.log(table.toString())
  }

  generateLogTable(titles: string[]): any {
    return new Table({
      head: titles,
      colWidths: titles.map((title: string) => 20)
    });
  }

  formatDate(d: Date): string {
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('/')
  }

  formatDateStr(date: string): string {
    let d = new Date(date)
    return this.formatDate(d)
  }

  getLastWeekDate(): Date {
    const today: Date = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  }

  _colorLogHours(hour: number): string {

    const hourStr: string = hour.toFixed(0)

    if (hour <= 1) {
      return this._high(hourStr)
    } else if (hour <= 3) {
      return this._medium(hourStr)
    } else if (hour <= 5) {
      return this._low(hourStr)
    } else if (hour > 12) {
      return this._medium(hourStr)
    }
    return hourStr
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
