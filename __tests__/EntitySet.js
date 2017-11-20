const { DbContext, Entity } = require('../')

test(`An EntitySet should load the entities`, () => {
  var db = new DbContext()
  db.register({ name: 'users' })

  expect(db.users).toBeDefined()
})

test(`An EntitySet should filter entities correctly`, () => {
  var db = DbContext.getInstance()

  var users = db.users.where(u => u.age >= 30)
  expect(users.length).toBe(2)
})

test(`An EntitySet should get the first entity`, () => {
  var db = DbContext.getInstance()

  var first = db.users.first()
  expect(first).toBeDefined()

  var firstFiltered = db.users.first(u => u.name.toLowerCase().indexOf('Jay'))
  expect(firstFiltered).toBeDefined()
})

test(`An EntitySet should join other EntitySets correctly on its Entitys`, () => {
  var db = new DbContext()
  db.register({
    name: 'addresses'
  })
  db.register({
    name: 'users',
    joins: {
      address: {
        schema: 'addresses',
        on: (user, address) => user.address === address.id
      }
    }
  })

  expect(db.users.first().address).toBeInstanceOf(Object)
})

test(`It should not matter what order EntitySets are registered in for joins`, () => {
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

  expect(db.users.first().address).toBeInstanceOf(Object)
})

test(`An EntitySet should support one-to-many joins`, () => {
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

  expect(db.users.first().permissions).toBeInstanceOf(Array)
  expect(db.users.first().permissions[0]).toBeInstanceOf(Entity)
})

test(`EntitySet should add a new entity correctly`, () => {
  var db = DbContext.getInstance()

  db.users.add({
    id: '3-bob-jones',
    name: 'Bob Jones'
  })

  var bob = db.users.first(u => u.name.indexOf('Bob') > -1)
  expect(bob).toBeDefined()
  expect(bob).toBeInstanceOf(Object)
  expect(bob.id).toBe('3-bob-jones')
  expect(bob.name).toBe('Bob Jones')
})

test(`EntitySet.where() should return an EntitySet if no filter is supplied`, () => {
  var db = DbContext.getInstance()

  var users = db.users.where()
  expect(users).toBeDefined()
})

test(`EntitySet should throw an error when trying to add a Entity without an ID`, () => {
  var db = DbContext.getInstance()

  expect(() => {
    db.users.add({ foo: 'bar' })
  }).toThrow(Error)
})

test(`EntitySet.remove(Entity) should remove the entity`, () => {
  var db = DbContext.getInstance()

  var first = db.users.first()
  db.users.remove(first)
  expect(db.users.first().id).not.toBe(first)
})

test(`EntitySet.remove(Object) should throw an error if the object does not have an id`, () => {
  var db = DbContext.getInstance()
  expect(() => {
    db.users.remove({ foo: 'bar' })
  }).toThrow(Error)
})
