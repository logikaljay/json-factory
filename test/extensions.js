const { expect } = require('code')
const { describe, before, it } = require('mocha')
const path = require('path')
var fs = require('fs')

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

describe('JSON Extensions', () => {
  it(`should get all items`, done => {
    expect(QuotesFactory.get()).to.be.array()
    done()
  })

  it(`should get all items that matches a filter function`, done => {
    expect(QuotesFactory.get(q => q.total > 100)).to.be.array()
    done()
  })

  it(`should get the first item`, done => {
    expect(QuotesFactory.first()).to.be.object()
    done()
  })

  it(`should get the first item that matches a filter function`, done => {
    expect(QuotesFactory.first(q => q.total === 2999)).to.be.object()
    done()
  })

  it(`should return a new identifier`, done => {
    var newEntity = QuotesFactory.create('foobar')
    expect(newEntity.name).to.equal('foobar')
    expect(newEntity.number).to.be.number()
    expect(newEntity.id).to.equal(`${newEntity.number}-foobar`)
    done()
  })

  it(`should return a new identifier with other object properties`, done => {
    var newEntity = QuotesFactory.create('foobar', { price: 200 })
    expect(newEntity.price).to.equal(200)
    done()
  })

  it(`should add a new entity to the store`, done => {
    var entity = QuotesFactory.create('foobar', { price: 200 })
    var result = QuotesFactory.save(entity)
    expect(result).to.equal(true)

    var entityPath = path.join('./data/quotes', `${entity.id}.json`)
    var exists = fs.existsSync(entityPath)
    expect(exists).to.equal(true)
    fs.unlinkSync(entityPath)

    done()
  })

  it(`should update an entity on save`, done => {
    var randomPrice = Math.floor(Math.random() * 1000)

    var entity = QuotesFactory.first()
    entity.total = randomPrice
    var result = QuotesFactory.save(entity)
    expect(result).to.equal(true)

    var updatedEntity = QuotesFactory.first()
    expect(updatedEntity.total).to.equal(randomPrice)

    done()
  })

  it(`should not save an entity without an id`, done => {
    var entity = { foo: 'bar' }
    var result = QuotesFactory.save(entity)
    expect(result).to.equal(false)

    done()
  })

  it(`should only save the join key, not their entire joint object`, done => {
    var ClientsFactory = require('../')({
      name: 'clients',
      path: path.resolve('./data/clients')
    })

    var client = ClientsFactory.first(c => c.id === '2-client-b')
    var quote = QuotesFactory.first(q => q.id === '1-test-quote')
    quote.client = client.id
    QuotesFactory.save(quote)

    // remove the file from the require cache - as it has changed
    var rawDataPath = path.join('../data/quotes/', '1-test-quote.json')
    delete require.cache[require.resolve(rawDataPath)]
    var quoteData = require(rawDataPath)
    expect(quoteData.client).to.equal('2-client-b')
    done()
  })

  it(`should limit the data correctly`, done => {
    var ClientsFactory = require('../')({
      name: 'clients',
      path: path.resolve('./data/clients')
    })

    var limitedData = ClientsFactory.limit(0, 1)
    expect(limitedData.length).to.equal(1)
    done()
  })
})

