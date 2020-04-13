export const status = ['StartedWork', 'Solved', 'Verified', 'Closed', 'Rejected']
export const statusDesc = status.map((cur: string, index: number) => `${index} => ${cur} \n`)

export const storyPointsValues: number[] = [0.5, 1, 2, 3, 5, 8, 13]