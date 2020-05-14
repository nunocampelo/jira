import { Command, flags } from '@oclif/command'
import { csvParser } from '../utils/csv-parser'
import { jiraClient, TaskRequestCreation } from '../jira/jira-client'
import JiraCommand from '../abstract/jira-command'
import { Logger, createLogger } from '@jsincubator/core'
import { Result } from 'neverthrow'
import * as requestCreationMapper from '../jira/request-creation-mapper'

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
${this.components.data.map((cur: string) => `${cur}\n`)}

People:
${this.people.data.map((cur: any, index: number) => `${cur.name}\n`)}

Issue types:
${this.issueTypes.data.map((cur: string) => `${cur}\n`)}

Priorities:
${this.priorities.data.map((cur: string) => `${cur}\n`)}`

  }

  async run() {

    const { args, flags } = this.parse(Import)
    const delimiter: string = flags.delimiter

    logger.info(`parsing file %s...`, flags.file)

    const csvTasks: any = (await csvParser.parse(flags.file, flags.rowDelimiter))
    const tasks: (TaskRequestCreation)[] = csvTasks.map((row: any): TaskRequestCreation => requestCreationMapper.fromCsvRow(row, delimiter))

    logger.info(`creating tasks...`)

    const creationErrors: string[] = []

    for (let index = 0; index < tasks.length; index++) {

      const task: TaskRequestCreation = tasks[index]
      const result: Result<any, Error> = await jiraClient.addTask(task)

      if(result.isErr()) {
        creationErrors.push(`record:${index + 1} summary:${task.summary}`)
      }
    }

    if (creationErrors.length > 0) {
      logger.error(`aggregated faliure to create the following tasks (see errors above):`)
      creationErrors.forEach((cur: string) => {
        logger.error(cur)
      })
    }
  }
}

