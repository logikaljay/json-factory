module.exports = {
  name: 'get',
  func: (data, schema) => func => {
    var { name } = schema
    if (!func) {
      return data[name]
    }

    return data[name].filter(func)
  }
}
