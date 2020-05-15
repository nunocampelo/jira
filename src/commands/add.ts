import { Command, flags } from '@oclif/command'
import { Builder } from 'builder-pattern'

import { Builder as JQBuilder, JiraQueryBuilder, Operation } from '../jira/jira-query-builder'
import { jiraClient, JiraClient, TaskRequestCreation } from '../jira/jira-client'
import * as requestCreationMapper from '../jira/request-creation-mapper'
import JiraCommand from '../abstract/jira-command'
import config from '../config/thales'
import { test } from '../jira/request-creation-mapper';

export default class Add extends JiraCommand {

  async init() {

    await super.init()

    test()

//     Add.description = `task creation

// ${this.people.description}
// ${this.issueStatus.description}
// ${this.components.description}
// ${this.versions.description}`

    Add.flags = {
      help: flags.help({ char: 'h' }),
      summary: flags.string({ char: 's', description: `task summary`, required: true }),
      type: flags.string({ char: 't', description: `issue type`, required: true, options: this.issueTypes.data }),
      project: flags.string({ char: 'p', description: `jira project`, required: true, default: config.jira.project.name}),
      assignee: flags.string({ char: 'a', description: `task assignee`, required: false, options: Object.keys(this.people.data)}),
      description: flags.string({ char: 'd', description: `task description (lines are splitted using \n)`, required: false }),
      components: flags.string({ char: 'c', description: `component names (split by the delimiter character)`, required: false }),
      epic: flags.string({ char: 'e', description: `epic key`, required: false }),
      versions: flags.string({ char: 'v', description: `issue versions (split by the delimiter character)`, required: false }),
      fixVersions: flags.string({ char: 'f', description: `issue fix versions (split by the delimiter character)`, required: false}),
      delimiter: flags.string({ char: 'l', description: `delimiter to split with`, required: false, default: ',' }),
    } 
  }

  async run() {
    const { args, flags } = this.parse(Add)
    await this.add(flags)
  }

  async add(flags: any = {}) {

    if (flags.assignee) {
      flags.assignee = config.team.people[flags.assignee].tgi
    }

    if(flags.components){
      flags.components = this.getNamesByIndexes(this.components.data, flags.delimiter, flags.components)
    }
    
    const request: TaskRequestCreation = requestCreationMapper.fromCliFlags(flags, flags.delimiter)
    const response = await jiraClient.addTask(request)
  }
}
