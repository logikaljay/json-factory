const EventEmitter = require('events')
const Factory = require('./src/factory')

var _schemas = []
var _instances = []
var _joins = []

var emitter = new EventEmitter()

var extensions = [
  require('./src/extensions/create'),
  require('./src/extensions/first'),
  require('./src/extensions/get'),
  require('./src/extensions/limit')
]

module.exports = schema => {
  var data = schema.data
  delete schema.data

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
