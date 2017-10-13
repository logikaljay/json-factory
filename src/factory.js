module.exports = (
  schema,
  extensions,
  _instances,
  _schemas,
  _joins,
  emitter,
  data
) => {
  return class Factory {
    constructor() {
      extensions.map(extension => {
        this[extension.name] = extension.func(this, schema, _instances)
      })
      ;(schema.extensions || []).map(extension => {
        this[extension.name] = extension.func(this, schema, _instances)
      })

      this._schema = schema
      _schemas[schema.name] = schema

      this[schema.name] = data
      this.join()
    }

    join(entity) {
      var { joins, name } = this._schema
      if (!joins) {
        return
      }

      const doJoin = (schema, join, on, prop) => {
        if (process.env.DEBUG) {
          console.info(`[FACTORY] joining ${name}.${prop} => ${join.schema}`)
        }

        // if already joined - skip
        if (_joins.hasOwnProperty(name) && _joins[name].hasOwnProperty(prop)) {
          return
        }

        var data = _instances[schema][join.schema]
        this[name].forEach(item => {
          if (!_joins.hasOwnProperty(item.id)) {
            _joins[item.id] = {
              [prop]: ''
            }
          }

          if (Array.isArray(item[prop])) {
            _joins[item.id][prop] = data.filter(d => on(item, d)) || []
          } else {
            _joins[item.id][prop] = data.filter(d => on(item, d))[0] || {}
          }

          if (_joins[item.id][prop].hasOwnProperty('id')) {
            Object.defineProperty(item, prop, {
              configurable: true,
              get: () => {
                // return data.filter(d => on(item, d))[0] || {}
                return _joins[item.id][prop]
              },

              set: val => {
                if (typeof val === 'string') {
                  val = { [prop]: val }
                }

                _joins[item.id][prop] = data.filter(d => on(val, d))[0] || {}
              }
            })
          } else if (Array.isArray(_joins[item.id][prop])) {
            Object.defineProperty(item, prop, {
              configurable: true,
              get: () => {
                return _joins[item.id][prop]
              },

              set: val => {
                if (typeof val === 'string') {
                  val = { [prop]: val }
                }

                _joins[item.id][prop] = data.filter(d => on(val, d)) || []
              }
            })
          }
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
}
