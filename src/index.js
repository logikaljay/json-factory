const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const Factory = require('./factory')
var emitter = new EventEmitter()

var _schemas = []
var _instances = []
var _joins = []

var extensions = [
  require('./extensions/create'),
  require('./extensions/first'),
  require('./extensions/get'),
  require('./extensions/limit'),
  require('./extensions/save')
]

module.exports = schema => {
  var { name } = schema
  var data = fs.readdirSync(schema.path).filter(f => f.endsWith('.json'))

  data = data
    .map(item => {
      try {
        return require(path.join(schema.path, item))
      } catch (err) {
        return {}
      }
    })
    .filter(q => q !== {})

  this[name] = data

  if (process.env.DEBUG) {
    console.info(`[FACTORY] loaded ${name}`)
  }

  var factory = Factory(
    schema,
    extensions,
    _instances,
    _schemas,
    _joins,
    emitter,
    data
  )
  _instances[schema.name] = new factory()
  emitter.emit(`load__${schema.name}`)

  return _instances[schema.name]
}
