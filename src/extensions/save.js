const fs = require('fs')
const path = require('path')

module.exports = {
  name: 'save',
  func: (data, schema) => {
    return entity => {
      this.errors = []

      // TODO: write some way to validate the item required data before writing it
      if (!entity.id) {
        this.errors.push('No `id` property was present on the data entity')
      }

      if (this.errors.length > 0) {
        return false
      }

      for (var i in data[schema.name]) {
        if (data[schema.name][i].id === entity.id) {
          data[schema.name][i] = entity
        }
      }

      // iterate over item, checking for join meta data
      var itemToWrite = {}
      for (var key in entity) {
        if (entity[key]._join) {
          if (key.startsWith('_')) {
            continue
          } else {
            itemToWrite[key] = entity[`_${key}`].id
          }
        } else {
          itemToWrite[key] = entity[key]
        }
      }

      fs.writeFileSync(
        path.join(schema.path, `${itemToWrite.id}.json`),
        JSON.stringify(itemToWrite)
      )

      return true
    }
  }
}
