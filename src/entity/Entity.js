//@flow
const reduce = require('lodash/reduce')

var _adapter: Adapter
var _data: { [key: string]: { [key: string]: Object } } = {}

class Entity extends Object {
  id: string
  _data: Object
  _schema: string

  constructor(schema: string, entity: string) {
    super()
    var data = _adapter.get(schema, entity)

    for (var p in data) {
      this[p] = data[p]
    }

    this.id = data.id
    this._schema = schema
    if (!_data[schema]) {
      _data[schema] = {}
    }

    _data[schema][data.id] = data
  }

  modifiedFields(): Array<string> {
    return reduce(
      _data[this._schema][this.id],
      (result, value, key) => {
        if (
          typeof this[key] === 'object' &&
          this[key].hasOwnProperty('_join')
        ) {
          return value === this[key].id ? result : result.concat(key)
        }

        return value === this[key] ? result : result.concat(key)
      },
      []
    )
  }

  modified(): boolean {
    return this.modifiedFields().length === 0 ? false : true
  }
}

module.exports = (adapter: Adapter): Class<Entity> => {
  _adapter = adapter
  return Entity
}
