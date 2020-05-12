import { Command, flags } from '@oclif/command'
import { Builder } from 'builder-pattern'

import { people, peopleDesc } from '../constants/team'
import { Builder as JQBuilder, JiraQueryBuilder, Operation } from '../utils/jira-query-builder'
import { jiraClient, JiraClient, TaskRequestCreation, SubTaskRequestCreation, TaskType } from '../utils/jira-client'

export default class Task extends Command {
  static description = `task creation
  
People flag description
${peopleDesc}`

  static flags = {
    help: flags.help({ char: 'h' }),
    summary: flags.string({ char: 's', description: `task summary`, required: true }),
    assignee: flags.string({ char: 'a', description: `task assignee`, required: false, default: '8' }),
    description: flags.string({ char: 'd', description: `task description (lines are splitted using the delimiter flag)`, required: false, default: 'h2. TODO,* See subtasks' }),
    component: flags.string({ char: 'c', description: `component name`, required: false }),
    epic: flags.string({ char: 'e', description: `epic key`, required: false }),
    versions: flags.string({ char: 'v', description: `version`, required: false, default: '1.2.0' }),
    frontend: flags.boolean({ char: 'f', description: `includes frontend`, required: false, default: false }),
    backend: flags.boolean({ char: 'b', description: `includes backend`, required: false, default: false }),
    tests: flags.boolean({ char: 't', description: `includes SDT tests update`, required: false, default: false }),
    requirements: flags.boolean({ char: 'r', description: `includes requirements`, required: false, default: false }),
    automation: flags.boolean({ char: 'o', description: `includes UATs`, required: false, default: false }),
    delimiter: flags.string({ char: 'l', description: `delimiter to split with`, required: false, default: ',' }),
  }
  // static args = [{ name: 'operation', required: true, description: 'task operation to perform', options: ['get', 'add'] }]

  async run() {

    const { args, flags } = this.parse(Task)
    await this.add(flags)

    // switch (args.operation) {
    //   case 'get':
    //     await this.get(flags)
    //     break
    //   case 'add':
    //     await this.add(flags)
    //     break
    // }
  }

  async add(flags: any = {}) {

    const delimiter: string = flags.delimiter

    const taskRequestCreationTemplate: TaskRequestCreation = {
      summary: flags.summary,
      assignee: people[flags.assignee].tgi,
      description: flags.description.split(delimiter),
      componentName: flags.component,
      labels: [],
      versions: flags.versions.split(delimiter),
      fixVersions: flags.versions.split(delimiter),
      epic: flags.epic,
      subTasks: [],
      backendSubTasks: flags.backend,
      frontendSubTasks: flags.frontend,
      stdTestsSubTasks: flags.tests,
      requirementSubTasks: flags.requirements,
      automationSubTasks: flags.automation,
      storyPoints: -1
    }

    console.log(taskRequestCreationTemplate)
    const parentTaskRequestCreation: TaskRequestCreation = Builder(taskRequestCreationTemplate).build()
    await jiraClient.addTask(parentTaskRequestCreation)
  }
}
