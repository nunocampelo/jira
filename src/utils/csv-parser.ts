const csv=require('csvtojson')

const parse = (file: string, delimiter: string = ';'): any => {
    return csv({delimiter}).fromFile(file)
}

export const csvParser = {
    parse
}

export interface CsvParser {
    parse(file: string, delimiter: string): any
}