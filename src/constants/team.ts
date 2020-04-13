const path = require('path')
import { envLoader, configLoader } from '@jsincubator/core'

envLoader.load(path.resolve(`${__dirname}/../../.env`))

export const dailyWorkingHours: number = configLoader.load('team.dailyWorkingHours') 
export const people: any[] = configLoader.load('team.people') 

export const peopleDesc = people.map((cur: any, index: number) => `${index} => ${cur.name} \n`)

export const indexesToTGIs = (peopleIndexes: string[]): string[] => {
    return peopleIndexes.map((index: string) => people[+index].tgi)
}

export const getTGIByJiraName = (jiraName: string) => {
    const names: string[] = jiraName.split(' ')
    const name = `${names[1].charAt(0).toUpperCase() + names[1].slice(1)} ${names[0].charAt(0).toUpperCase() + names[0].slice(1).toLowerCase()}`
    return people.find((person: any) => person.name === name).tgi
}