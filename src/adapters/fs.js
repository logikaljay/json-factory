//@flow

const fs = require('fs')
const path = require('path')

module.exports = (p: string) => {
  return {
    list: (schema: string): Array<string> => {
      return fs
        .readdirSync(path.join(p, schema))
        .filter(f => f.endsWith('.json'))
    },

    set: (schema: string, entity: Object): boolean => {
      if (!entity.id) {
        throw new Error('Entity does not have an ID')
      }

      fs.writeFileSync(
        path.join(p, schema, `${entity.id}.json`),
        JSON.stringify(entity)
      )

      return true
    },

    get: (schema: string, entity: string): Object => {
      if (!entity.endsWith('.json')) {
        entity = entity + '.json'
      }

      var pathToEntity = path.join(p, schema, entity)
      if (!fs.existsSync(pathToEntity)) {
        return {}
      }

      var data = fs.readFileSync(pathToEntity).toString()
      return JSON.parse(data)
    }
  }
}
