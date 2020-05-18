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
            host: 'jira.prz.ics.eu-west-1.aws.thales',
            username: process.env.JIRA_USERNAME,
            password: process.env.JIRA_PASSWORD,
            apiVersion: '2',
            strictSSL: false
        },
        project: {
            name: 'VLBSFI_GDP_AG'
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
                tgi: 'T0191669',
                name: 'Samuel Ferreira',
            },
            {
                tgi: 'T0186401',
                name: 'Andre Veiga',
            },
            {
                tgi: 'T0203203',
                name: 'Joana Dias',
            },
            {
                tgi: 'T0209611',
                name: 'David Nascimento',
            },
            {
                tgi: 'T0202788',
                name: 'Nuno Rodrigues',
            },
            {
                tgi: 'S0075456',
                name: 'David Morais',
            },
            {
                tgi: 'T0227153',
                name: 'Pedro Rainho',
            },
            {
                tgi: 'T0206442',
                name: 'Nuno Campelo',
            },
            {
                tgi: 'T0232556',
                name: 'Miguel Oliveira',
            },
            {
                tgi: 'S0089569',
                name: 'Thales Santos',
            },
            {
                tgi: 'S0089991',
                name: 'Josenildo Neves',
            },
            {
                tgi: 'S0089574',
                name: 'David Raposo',
            },
            {
                tgi: 'S0074735',
                name: 'Ivone Leite',
            },
            {
                tgi: 'T0228108',
                name: 'Diogo Prata',
            }
        ]
    },
    components: {
        exclude: [
            'Archetype Client Server',
            'Archetype Resource Server',
            'CF @ gdp.at.thales',
            'CF @ gdp.pt.thales',
            'CLI',
            'Commons',
            'Commons Async',
            'Commons Auth',
            'Commons Entities',
            'Commons Error Handling',
            'Commons Logger',
            'Commons MVC',
            'Commons Security',
            'Commons Tester',
            'Data Hut',
            'Development Infrastructure',
            'Event Manager',
            'Installer',
            'Notification Center',
            'Platform Stack',
            'Recording & Playback',
            'Time Server',
            'Workflow Manager'
        ]
    }
}