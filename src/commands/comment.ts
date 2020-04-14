import {Command, flags} from '@oclif/command'
import { jiraClient } from '../utils/jira-client'

export default class Comment extends Command {
  static description = 'manage comments'

  static flags = {
    help: flags.help({char: 'h'}),
    issueNumber: flags.string({ char: 'i', description: `issue number`, required: true }),
    text: flags.string({ char: 't', description: `text`, required: true }),
  }

  async run() {
    const {args, flags} = this.parse(Comment)
    jiraClient.addComment(+flags.issueNumber, flags.text)
  }
}
