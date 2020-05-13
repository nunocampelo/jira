import { Command, flags } from '@oclif/command'
import { csvParser } from '../utils/csv-parser'
import { jiraClient, TaskRequestCreation, TaskType, TestRequestCreation } from '../utils/jira/jira-client'
import JiraCommand from '../abstract/jira-command'

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
${this.issueTypes.data.map((cur:string) => `${cur}\n`)}

Priorities:
${this.priorities.data.map((cur:string) => `${cur}\n`)}`

  }

  async run() {

    const { args, flags } = this.parse(Import)
    const delimiter: string = flags.delimiter

    console.log(`parsing csv ${flags.file}`)

    const csvTasks: any = (await csvParser.parse(flags.file, flags.rowDelimiter)).filter((el: any) => el && el.summary && el.summary !== '')

    const tasks: (TaskRequestCreation | TestRequestCreation)[] = csvTasks.map((el: any): TaskRequestCreation | TestRequestCreation => {

      // console.log(el.description.split('\\n'))
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
    console.log(`creating tasks...\n`)
    
    for (let index = 0; index < tasks.length; index++) {

      
      const task: TaskRequestCreation | TestRequestCreation = tasks[index]

      const taskCreationFunction: Function = task.type === 'Test'? jiraClient.addTest : jiraClient.addTask; 
      const taskCreationResult: any = await taskCreationFunction(task)
      
      if(taskCreationResult.error) {
        creationError.push(`line:${index + 1} summary:${task.summary}`)
        console.log(`error creating task '${task.summary}': ${taskCreationResult.error.message}`)
      } else {
        console.log(`created task '${task.summary}' with key ${taskCreationResult.result}`)
      }
      // if(task.type === 'Test'){

      //   await jiraClient.addTest(task as TestRequestCreation)
        
      // } else {
        
      //   await jiraClient.addTask(task)
      // }
    }

    console.log(`\nfailed to create (see errors above):${creationError.reduce((acc: string, cur: string) => `${acc}\n${cur}`, '')}`)
  }
}

