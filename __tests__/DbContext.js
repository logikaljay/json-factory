const { DbContext } = require('../')
const emitter = require('../src/lib/emitter')

test('Throw an error if initiated without a storage adapter', () => {
  expect(DbContext.bind()).toThrow(Error)
})

test('Register a schema correctly', () => {
  var db = new DbContext()
  db.register({
    name: 'users'
  })

  expect(db.users).toBeDefined()
})

test('Fire registration events', () => {
  emitter.once('register__users', () => {
    expect(1).toBe(1)
  })

  var db = new DbContext()
  db.register({
    name: 'users'
  })
})

test('Return a shared instance', () => {
  var db = DbContext.getInstance()

  expect(db.users).toBeDefined()
})

test(`DbContext should throw an error if registering a schema that has already been registered`, () => {
  var db = DbContext.getInstance()

  expect(() => {
    db.register({
      name: 'users'
    })
  }).toThrow(Error)
})
