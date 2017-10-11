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
          // debugger
          // var joinData = data.filter(d => on(item, d))[0] || {}

          if (!_joins.hasOwnProperty(item.id)) {
            _joins[item.id] = {
              [prop]: ''
            }
          }

          // debugger

          _joins[item.id][prop] = data.filter(d => on(item, d))[0] || {}

          // add some meta data to the joins array
          // _joins[name] = Object.assign({}, _joins[name], {
          //   [prop]: {
          //     schema: _schemas[schema].name,
          //     from: name,
          //     originalValue: joinData.id,
          //     property: prop,
          //     id: joinData.id
          //   }
          // })

          if (typeof item[prop] === 'string') {
            Object.defineProperty(item, prop, {
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
          }
          // item[prop] = joinData

          // Object.defineProperty(item, prop, {
          //   get: function() {
          //     return (
          //       data.filter(d => on({ [prop]: _joins[name][prop].id }, d))[0] ||
          //       {}
          //     )
          //   },

          //   set: function(val) {
          //     var newData = data.filter(d => on({ [prop]: val }, d))[0] || {}
          //     _joins[name][prop] = Object.assign({}, newData, {
          //       schema: _schemas[schema].name,
          //       from: name,
          //       originalValue: item[prop],
          //       property: prop
          //     })
          //   }
          // })
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
