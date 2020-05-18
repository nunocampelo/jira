require('dotenv').config()
import { Logger, createLogger } from '@jsincubator/core'

const logger: Logger = createLogger('config')

if(!process.env.JIRA_USERNAME && !process.env.JIRA_PASSWORD) {
    logger.error('missing jira user and/or password check the config section in readme')
    process.exit(1)
}

logger.info('using jira user %s', process.env.JIRA_USERNAME)

export default {
    jira: {
        client: {
            protocol: 'https',
            host: 'jira.sample.com',
            username: process.env.JIRA_USERNAME,
            password: process.env.JIRA_PASSWORD,
            apiVersion: '2',
            strictSSL: false
        },
        project: {
            name: 'MY_PROJECT'
        },
        query: {
            startAt: 0,
            maxResults: 200,
            validateQuery: true,
            fields: undefined 
        }
    },
    team: {
        people: [
            {
                tgi: 'USER123',
                name: 'John Doe',
            }
        ]
    },
    components: {
        exclude: [
            'Project Name'
        ]
    }
}