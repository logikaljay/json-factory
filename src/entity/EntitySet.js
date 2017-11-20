//@flow
var Entity = require('./Entity')

var _adapter: Adapter
var _joins: {
  [key: string]: { [key: string]: { [key: string]: Object | Array<Object> } }
} = {}

class EntitySet {
  _data: Array<{ id: string, _join?: boolean }>
  _entities: Array<string>
  _schema: string

  static fromData(schema: string, data: Array<Object>) {
    var entities = data.map(d => `${d.id}.json`)
    return new EntitySet(schema, entities)
  }

  constructor(schema: string, entities: Array<string | any>) {
    this._data = []
    this._entities = entities
    this._schema = schema
    var EntityCreator = Entity(_adapter)

    entities.forEach(entity => {
      this._data.push(new EntityCreator(schema, entity))
    })
  }

  join(
    from: string,
    entitySet: EntitySet,
    property: string,
    on: Function
  ): void {
    for (var entity of this._data) {
      if (!_joins[from] || !_joins[from][entity.id]) {
        _joins[from] = Object.assign({}, _joins[from], {
          [entity.id]: {
            [property]: {}
          }
        })
      }

      if (Array.isArray(entity[property])) {
        var data = entitySet._data.filter(e => on(entity, e)) || []
        _joins[from][entity.id][property] = data

        for (var item of _joins[from][entity.id][property]) {
          item._join = true
        }
      } else {
        var data = entitySet._data.filter(e => on(entity, e))[0] || {}
        data._join = true

        _joins[from][entity.id][property] = data
      }

      if (Array.isArray(entity[property])) {
        Object.defineProperty(entity, property, {
          configurable: true,

          get: function() {
            return _joins[from][this.id][property]
          },

          set: function(val) {
            val = { [property]: val }

            var joinedData = entitySet._data.filter(e => {
              return on(val, e)
            })

            joinedData = joinedData.map(i => {
              i._join = true
              return i
            })

            _joins[from][this.id][property] = joinedData
          }
        })
      } else {
        Object.defineProperty(entity, property, {
          configurable: true,

          get: function() {
            return _joins[from][this.id][property]
          },

          set: function(val) {
            var joinedData = entitySet._data.filter(e =>
              on({ [property]: val }, e)
            )[0]

            joinedData = Object.assign({}, joinedData, {
              _join: true
            })

            _joins[from][this.id][property] = joinedData
          }
        })
      }
    }
  }

  first(func: Function): Entity {
    if (func) {
      return this._data.filter(func)[0]
    }

    return this._data[0]
  }

  where(func: Function): EntitySet {
    if (!func) {
      func = q => q
    }

    return EntitySet.fromData(this._schema, this._data.filter(func))
  }

  add(entity: Entity): boolean {
    if (!entity.id) {
      throw new Error('Entity does not have an id')
    }

    this._data.push(entity)
    return true
  }

  remove(entity: Entity): boolean {
    if (!entity.id) {
      throw new Error('Entity does not have an ID')
    }

    this._data.splice(this._data.indexOf(entity), 1)
    return true
  }

  get length() {
    return this._data.length
  }
}

module.exports = (adapter: Adapter): Class<EntitySet> => {
  _adapter = adapter
  return EntitySet
}
