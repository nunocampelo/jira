import { Command, flags } from '@oclif/command'
import { csvParser } from '../utils/csv-parser'
import { jiraClient, TaskRequestCreation, TaskType } from '../utils/jira-client'
import { getTGIByJiraName } from '../constants/team'
import JiraCommand from './jira-command'

export default class Import extends JiraCommand {
  static description = 'import tasks from csv'

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: `csv file path to import`, required: true }),
    rowDelimiter: flags.string({ char: 'r', description: `csv fields delimiter`, required: false, default: ',' }),
    delimiter: flags.string({ char: 'd', description: `inside field value delimiter`, required: false, default: ',' }),
    // boardIndex: flags.string({ char: 'b', required: false, default:'4' }),
  }

  // static args = [{ name: 'file' }]

  async init() {

    await super.init()

    Import.description = `import tasks from csv

${this.boards.description}

${this.components.description}`

    // Import.flags = {
    //   ...Import.flags,
    //   ...JiraCommand.flags
    // }
  }

  async run() {
    const { args, flags } = this.parse(Import)

    const delimiter: string = flags.delimiter
    const csvTasks: any = (await csvParser.parse(flags.file, flags.rowDelimiter)).filter((el: any) => el && el.summary && el.summary !== '')

    const tasks: TaskRequestCreation[] = csvTasks.map((el: any): TaskRequestCreation => {
      return {
        ...el,
        summary: el.component ? `${el.component} | ${el.summary}` : el.summary,
        versions: el.versions ? el.versions.split(delimiter) : [],
        fixVersions: el.fixVersions ? el.fixVersions.split(delimiter) : [],
        labels: el.labels ? el.labels.split(delimiter) : [],
        assignee: el.assignee ? getTGIByJiraName(el.assignee) : '',
        storyPoints: el.storyPoints === '' ? undefined : +el.storyPoints
      }
    })

    for (let index = 0; index < tasks.length; index++) {
      const task: any = tasks[index]
      await jiraClient.addTask(task)
    }
  }
}

