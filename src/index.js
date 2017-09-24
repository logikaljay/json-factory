const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

var _schemas = []
var _instances = []
var emitter = new EventEmitter()

var extensions = fs.readdirSync(path.join('./src', 'extensions'))

module.exports = schema => {
  class Factory {
    constructor() {
      extensions.map(file => {
        var extension = require(`./extensions/${file}`)
        this[extension.name] = extension.func(this, schema, _instances)
      })
      ;(schema.extensions || []).map(extension => {
        this[extension.name] = extension.func(this, schema, _instances)
      })

      this._schema = schema
      _schemas[schema.name] = schema
      this.load()
      this.join()
    }

    load() {
      var { name } = this._schema
      var data = fs
        .readdirSync(this._schema.path)
        .filter(f => f.endsWith('.json'))

      data = data
        .map(item => {
          try {
            return require(path.join(this._schema.path, item))
          } catch (err) {
            return {}
          }
        })
        .filter(q => q !== {})

      this[name] = data
    }

    join(entity) {
      var { joins, name } = this._schema
      if (!joins) {
        return
      }

      const doJoin = (schema, join, on, prop) => {
        var data = _instances[schema][join.schema]

        this[name].forEach(item => {
          if (item[prop]._join) {
            return
          }

          var joinData = data.filter(d => on(item, d))[0] || {}

          // add some meta data to the join
          joinData._join = true
          joinData._schema = _schemas[schema].name
          joinData._value = item[prop]
          joinData._prop = prop
          item[`_${prop}`] = joinData

          Object.defineProperty(item, prop, {
            get: function() {
              return item[`_${prop}`]
            },

            set: function(val) {
              var newJoinData = Object.assign(
                {},
                data.filter(d => on({ [prop]: val }, d))[0] || {},
                {
                  _join: true,
                  _schema: _schemas[schema].name,
                  _value: val,
                  _prop: prop
                }
              )

              item[`_${prop}`] = newJoinData
            }
          })
        })
      }

      Object.keys(joins).map(prop => {
        var join = joins[prop]
        var { schema, on } = join

        // wait for the load event from the related schema(s)
        if (Object.keys(_instances).indexOf(schema) === -1) {
          emitter.on(`load__${schema}`, () => {
            doJoin(schema, join, on, prop)
          })
        } else {
          doJoin(schema, join, on, prop)
        }
      })
    }
  }

  _instances[schema.name] = new Factory()
  emitter.emit(`load__${schema.name}`)

  return _instances[schema.name]
}