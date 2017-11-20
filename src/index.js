//@flow

const DbContext = require('./entity/DbContext')
const EntitySet = require('./entity/EntitySet')
const Entity = require('./entity/Entity')

const DATA_DIR = `${process.cwd()}/data`
const adapter = require('./adapters/fs')(DATA_DIR)

module.exports = {
  DbContext: DbContext(adapter),
  EntitySet: EntitySet(adapter),
  Entity: Entity(adapter)
}
