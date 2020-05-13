import { Command, flags } from '@oclif/command'
import { csvParser } from '../utils/csv-parser'
import { jiraClient, TaskRequestCreation, TaskType, TestRequestCreation } from '../jira/jira-client'
import JiraCommand from '../abstract/jira-command'
import { Logger, createLogger } from '@jsincubator/core'

const logger: Logger = createLogger(`jira.commands.import`)

export default class Import extends JiraCommand {

  static flags = {
    help: flags.help({ char: 'h' }),
    file: flags.string({ char: 'f', description: `csv file path to import`, required: true }),
    rowDelimiter: flags.string({ char: 'r', description: `csv fields delimiter`, required: false, default: ',' }),
    delimiter: flags.string({ char: 'd', description: `inside field value delimiter`, required: false, default: ',' }),
  }

  async init() {

    await super.init()

    Import.description = `import tasks from csv

Components:
${this.components.data.map((cur: any, index: number) => `${cur.name}\n`)}

People:
${this.people.data.map((cur: any, index: number) => `${cur.tgi} => ${cur.name}\n`)}

Issue types:
${this.issueTypes.data.map((cur: string) => `${cur}\n`)}

Priorities:
${this.priorities.data.map((cur: string) => `${cur}\n`)}`

  }

  async run() {

    const { args, flags } = this.parse(Import)
    const delimiter: string = flags.delimiter

    logger.info(`parsing file %s...`, flags.file)

    const csvTasks: any = (await csvParser.parse(flags.file, flags.rowDelimiter)).filter((el: any) => el && el.summary && el.summary !== '')

    const tasks: (TaskRequestCreation | TestRequestCreation)[] = csvTasks.map((el: any): TaskRequestCreation | TestRequestCreation => {

      return {
        ...el,
        summary: el.summary,
        versions: el.versions ? el.versions.split(delimiter) : [],
        fixVersions: el.fixVersions ? el.fixVersions.split(delimiter) : [],
        labels: el.labels ? el.labels.split(delimiter) : [],
        assignee: el.assignee || '',
        storyPoints: el.storyPoints === '' ? undefined : +el.storyPoints,
        components: el.components.split(delimiter),
        description: el.description.split('\\n')
      }
    })

    const creationError: string[] = []
    logger.info(`creating tasks...`)

    for (let index = 0; index < tasks.length; index++) {

      const task: TaskRequestCreation | TestRequestCreation = tasks[index]
      const taskCreationFunction: Function = task.type === 'Test' ? jiraClient.addTest : jiraClient.addTask;
      const taskCreationResult: any = await taskCreationFunction(task)

      if (taskCreationResult.error) {
        creationError.push(`line:${index + 1} summary:${task.summary}`)
        logger.error(`error creating task '%s': %s`, task.summary, taskCreationResult.error.message)
      } else {
        logger.info(`created task '%s' with key %s`, task.summary, taskCreationResult.result)
      }

    }

    logger.info(`failed to create (see errors above):`)
    creationError.forEach((cur: string) => {
      logger.info(cur)
    })
  }
}

