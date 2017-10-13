const { expect } = require('code')
const { describe, before, it } = require('mocha')
const path = require('path')
var fs = require('fs')

const Factory = require('../../')
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

describe('One-to-One joins', () => {
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

  it(`should only save the join key, not their entire joined object`, done => {
    var client = ClientsFactory.first(c => c.id === '2-client-b')
    var quote = QuotesFactory.first(q => q.id === '1-test-quote')
    quote.client = client.id
    QuotesFactory.save(quote)

    // remove the file from the require cache - as it has changed
    var rawDataPath = path.join('../../data/quotes/', '1-test-quote.json')
    delete require.cache[require.resolve(rawDataPath)]
    var quoteData = require(rawDataPath)
    expect(quoteData.client).to.equal('2-client-b')
    done()
  })
})
