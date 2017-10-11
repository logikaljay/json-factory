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

      // iterate over item, checking each one to see if it is a join
      var itemToWrite = {}
      for (var key in entity) {
        if (schema.joins.hasOwnProperty(key)) {
          itemToWrite[key] = entity[key].id
        } else {
          itemToWrite[key] = entity[key]
        }
      }

      const fs = require('fs')
      const path = require('path')

      fs.writeFileSync(
        path.join(schema.path, `${itemToWrite.id}.json`),
        JSON.stringify(itemToWrite)
      )

      return true
    }
  }
}
