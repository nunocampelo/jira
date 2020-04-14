import { Command, flags } from '@oclif/command'

const path = require('path')
import { Inquirer, PromptModule, Answers } from 'inquirer'
import { jiraClient, JiraClient, TaskType, Component } from '../utils/jira-client'
import { Builder, JiraQueryBuilder, Operation } from '../utils/jira-query-builder'
import JiraCommand from './jira-command'
import { envLoader, configLoader } from '@jsincubator/core'

envLoader.load(path.resolve(`${__dirname}/../../.env`))
var inquirer: Inquirer = require('inquirer')
const prompt: PromptModule = inquirer.createPromptModule()

let versions: any[]
// const components: string[] = ['', 'Alarm Manager', 'Policy Manager', 'Apps Manager', 'Administraton Dashboard', 'App Log Manager', 'Application Monitoring and KPI']
// let componentNames: string[]
// const componentsBlackList: string[] = configLoader.load('components.exclude')

export default class Fix extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    boardIndex: flags.string({ char: 'b', required: true }),
    // componentIndex: flags.string({ char: 'c', required: false })
  }

  static args = [{ name: 'sprint', required: true }]

  async init() {

    await super.init()

    Fix.description = `fix tasks in an inconsistent state
${JiraCommand.description}`

    Fix.flags = {
      ...Fix.flags,
      ...JiraCommand.flags
    }
  }

  async run() {

    const { args, flags } = this.parse(Fix)

    versions = (await jiraClient.getVersions(this.getCurrentBoardId())).values

    versions.push('')
    // this.components = this.components.filter((cur: Component) => componentsBlackList.indexOf(cur.name) === -1)

    await this.fix(args.sprint.split(','))
  }

  fix = async (sprints: string[]) => {

    const sprintsVersion: string[] = sprints.map((sprint: string) => sprint.replace(/\D/g, ''))
    const response: any = (await jiraClient.getSprints(this.getCurrentBoardId(), true, true, false)).values

    for (let index = 0; index < response.length; index++) {

      const sprint: any = response[index]

      if (sprintsVersion.indexOf(sprint.name.replace(/\D/g, '')) === -1) {
        return
      }

      const query: string = Builder().paramEquals('sprint', sprint.id)
        .paramOperation('type', Operation.NOT_EQUALS, '"TM SubTask"')
        // .paramEquals('type', `"${TaskType.ProblemReport}"`)
        .build()

      const issues: any = await jiraClient.getIssues(this.getCurrentBoardId(), query)

      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i]

        // if (!issue.fields || !issue.fields.issuetype || !issue.fields.issuetype || !issue.fields.issuetype.name) {
        //   console.log(`Discarding issue ${issue.key} because wasn't able to fetch its type`)
        // }

        // const issueTypeName: string = issue.fields.issuetype.name
        await this._fixIssue(issue)
      }
    }
  }

  // _fixByType = async (issue: any, type: string) => {
  //   // switch (type) {
  //   //   case TaskType.ProblemReport:
  //   //     await this._fixProblemReport(issue)
  //   //     break
  //   // }
  // }

  _fixIssue = async (issue: any) => {

    const fields: any = issue.fields

    const missingComponent: boolean = !fields.components || fields.components.length === 0
    const missingFixVersions: boolean = !fields.fixVersions || fields.fixVersions.length === 0

    if (!missingComponent && !missingFixVersions) {
      return
    }

    console.log(`Missing fields in:\n${issue.key} - ${issue.fields.summary}`)
    const response: any = await prompt({ message: `Proceed with fix?`, name: 'confirm', type: 'confirm' })
    if (!response.confirm) {
      return
    }

    const payload: any = {
      update: {},
      fields: {}
    }

    if (missingComponent) {
      const componentsAnswer: any = await prompt({ message: `Please choose wanted component`, name: 'component', type: 'rawlist', choices: this.components.map((component: any) => component.name) })
      payload.update.components = [{ add: { name: componentsAnswer.component } }]
    }

    if (missingFixVersions) {
      const fixVersionAnswer: any = await prompt({ message: `Please choose wanted fix version`, name: 'version', type: 'rawlist', choices: versions })

      if (fixVersionAnswer.version) {
        payload.fields.fixVersions = [{ name: fixVersionAnswer.version }]
      }
    }

    await jiraClient.updateTask(issue.key, payload)
  }

  // _getComponentByName = (name: string) => {
  //   return components.filter((component: any) => component.name === name)
  // }
}
