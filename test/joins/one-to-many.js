const { expect } = require('code')
const { describe, before, it } = require('mocha')
const path = require('path')
var fs = require('fs')

const Factory = require('../../')
var QuotesFactory = Factory({
  name: 'quotes',
  path: path.resolve('./data/quotes'),
  joins: {}
})

var WorkOrdersFactory = Factory({
  name: 'workorders',
  path: path.resolve('./data/workorders'),
  joins: {
    quotes: {
      schema: 'quotes',
      on: (workorder, quote) => workorder.quotes.indexOf(quote.id) > -1
    }
  }
})

describe('One-to-Many joins', () => {
  it(`should load the joins correctly`, done => {
    var entity = WorkOrdersFactory.first()
    expect(entity.quotes).to.be.array()
    expect(entity.quotes[0]).to.be.object()
    done()
  })

  it(`One-to-many joined property should have add/remove methods`, done => {
    var workorder = WorkOrdersFactory.first()
    expect(workorder.quotes.add).to.be.function()
    expect(workorder.quotes.remove).to.be.function()
    done()
  })

  it(`should handle adding an object in to a one-to-many joined object`, done => {
    var workorder = WorkOrdersFactory.first()
    var quote = QuotesFactory.first(q => q.id === '3-foobar')
    workorder.quotes.add(quote)
    expect(workorder.quotes.length).to.equal(3)
    expect(workorder.quotes).to.contain(quote)
    done()
  })

  it(`should handle removing an object in a one-to-many joined object`, done => {
    var workorder = WorkOrdersFactory.first()
    var quote = QuotesFactory.first(q => q.id === '3-foobar')
    workorder.quotes.remove(quote)
    expect(workorder.quotes.length).to.equal(2)
    expect(workorder.quotes).to.not.contain(quote)
    done()
  })

  it(`should throw an error when trying to add a non entity to a joined object`, done => {
    var workorder = WorkOrdersFactory.first()
    var fakeQuote = { foo: 'bar' }
    expect(workorder.quotes.add.bind(null, fakeQuote)).to.throw(Error)
    done()
  })

  it(`should throw an error when trying to remove a non entity from a joined object`, done => {
    var workorder = WorkOrdersFactory.first()
    var fakeQuote = { foo: 'bar' }
    expect(workorder.quotes.remove.bind(null, fakeQuote)).to.throw(Error)
    done()
  })

  it(`should throw an error when trying to add an entity that already exists`, done => {
    var workorder = WorkOrdersFactory.first()
    var quote = QuotesFactory.get(q => q.id === '1-test-quote')
    expect(workorder.quotes.add.bind(null, quote)).to.throw(Error)
    done()
  })

  it(`should throw an error when trying to remove an entity that doesn't exist`, done => {
    var workorder = WorkOrdersFactory.first()
    var quote = QuotesFactory.get(q => q.id === '3-foobar')
    expect(workorder.quotes.remove.bind(null, quote)).to.throw(Error)
    done()
  })

  it(`should only save the join key, not their entire joined object`, done => {
    var workorder = WorkOrdersFactory.first()
    WorkOrdersFactory.save(workorder)

    // remove the file from the require cache - as it has changed
    var rawDataPath = path.join('../../data/workorders/', '1-work-order.json')
    delete require.cache[require.resolve(rawDataPath)]
    var workOrderData = require(rawDataPath)
    expect(workOrderData.quotes).to.contain('2-test-quote')
    expect(workOrderData.quotes).to.contain('1-test-quote')
    done()
  })
})
