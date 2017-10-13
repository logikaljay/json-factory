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
