module.exports = {
  name: 'first',
  func: (data, schema) => {
    return func => {
      if (!func) {
        return data[schema.name][0]
      }

      return data[schema.name].filter(func)[0]
    }
  }
}
