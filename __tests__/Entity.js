const { DbContext } = require('../')

test(`An entity should know if it has been modified`, () => {
  var db = new DbContext()
  db.register({
    name: 'users',
    joins: {
      address: {
        schema: 'addresses',
        on: (user, address) => user.address === address.id
      }
    }
  })

  db.register({
    name: 'addresses'
  })

  var user = db.users.first()
  expect(user.modified()).toBe(false)

  user.name = 'Bob'
  expect(user.modified()).toBe(true)
})

test(`An entity should know what fields have been modified`, () => {
  var db = DbContext.getInstance()

  var user = db.users.first()
  expect(user.modifiedFields()[0]).toBe('name')
})

test(`An entity should update the join data correctly when modified`, () => {
  var db = DbContext.getInstance()

  var user = db.users.first()
  user.address = '2-some-st'

  expect(user.address).toBeInstanceOf(Object)
})

test(`An entity should know when a join has been modified`, () => {
  var db = DbContext.getInstance()

  var user = db.users.first()
  expect(user.modifiedFields().length).toBe(2)
  expect(user.modifiedFields()[0]).toBe('name')
  expect(user.modifiedFields()[1]).toBe('address')
})

test(`An entity should update the one-to-many join data correctly when modified`, () => {
  var db = new DbContext()
  db.register({
    name: 'users',
    joins: {
      permissions: {
        schema: 'permissions',
        on: (user, permission) => user.permissions.indexOf(permission.id) > -1
      }
    }
  })
  db.register({
    name: 'permissions'
  })

  var first = db.users.first(u => u.name.toLowerCase().indexOf('jay') > -1)
  var firstPermission = first.permissions[0]
  first.permissions = ['2-write', '3-delete']
  expect(first.permissions[0].id).not.toBe('1-read')
  expect(first.permissions[0]._join).toBeDefined()
})
