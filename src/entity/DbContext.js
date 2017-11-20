//@flow
const emitter = require('../lib/emitter')
const EntitySet = require('./EntitySet')

// private variables
var _instances: Map<string, DbContext> = new Map()
var _joins: Object = {}
var _adapter: Adapter

class DbContext extends Object {
  static _instance: DbContext

  static getInstance() {
    return DbContext._instance
  }

  _data: EntitySet

  constructor() {
    super()
    _instances = new Map()
    _joins = {}

    DbContext._instance = this
  }

  register(schema: { name: string, joins: { [key: string]: Object } }) {
    var { name, joins } = schema

    if (_instances.has(name)) {
      throw new Error('Schema already registered')
    }

    var entities: Array<string> = _adapter.list(name).filter(e => e !== {})
    var EntitySetCreator: Class<EntitySet> = EntitySet(_adapter)
    var data = new EntitySetCreator(name, entities)

    if (joins) {
      for (var j in joins) {
        var joinSchema: string = joins[j].schema
        var on: Function = joins[j].on

        if (_instances.has(joinSchema)) {
          var instance = _instances.get(joinSchema)
          if (typeof instance !== 'undefined') {
            data.join(name, instance[joinSchema], j, on)
          }
        } else {
          emitter.once(`register__${joinSchema}`, () => {
            var instance = _instances.get(joinSchema)
            if (typeof instance !== 'undefined') {
              data.join(name, instance[joinSchema], j, on)
            }
          })
        }
      }
    }

    this[name] = data

    _instances.set(name, this)
    emitter.emit(`register__${schema.name}`)
  }
}

module.exports = (adapter: Adapter): Class<DbContext> => {
  _adapter = adapter
  return DbContext
}
