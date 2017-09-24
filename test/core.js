const { expect } = require('code')
const { describe, before, it } = require('mocha')
const path = require('path')

const Factory = require('../')
var QuotesFactory = Factory({
  name: 'quotes',
  path: path.resolve('./data/quotes'),
  joins: {
    client: {
      schema: 'clients',
      on: (quote, client) => quote.client === client.id
    }
  }
})

var ClientsFactory = Factory({
  name: 'clients',
  path: path.resolve('./data/clients')
})

describe('JSON Factory', () => {
  it(`should load no data if the path doesn't exist`, done => {
    var FakeFactory = Factory({
      name: 'fake',
      path: path.join('./data/fake')
    })

    expect(FakeFactory.get()).to.equal([{}])
    done()
  })

  it(`should load the joins correctly`, done => {
    var entity = QuotesFactory.first()
    expect(entity.client).to.be.object()
    done()
  })

  it(`should update join information after being set`, done => {
    var client = ClientsFactory.first(c => c.id === '2-client-b')
    var entity = QuotesFactory.first()
    entity.client = '2-client-b'
    expect(entity.client.name).to.equal(client.name)
    done()
  })

  it(`should load the extension methods`, done => {
    expect(QuotesFactory.create).to.exist()

    done()
  })

  it(`should load an extension during Factory invocation`, done => {
    var TestFactory = Factory({
      name: 'quotes',
      path: path.resolve('./data/quotes'),
      extensions: [
        {
          name: 'test',
          func: () => {
            return () => {
              done()
            }
          }
        }
      ]
    })

    TestFactory.test()
  })
})
