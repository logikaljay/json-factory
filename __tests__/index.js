const { DbContext, EntitySet, Entity } = require('../')

test('Initialise the classes correctly', () => {
  expect(DbContext).toBeDefined()
  expect(EntitySet).toBeDefined()
  expect(Entity).toBeDefined()
})
