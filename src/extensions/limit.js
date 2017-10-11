module.exports = {
  name: 'limit',
  func: (data, schema) => {
    return (start, length) => {
      // no start = return all data.
      if (typeof start === 'undefined') {
        return data[schema.name]
      }

      var copy = data[schema.name].slice()
      if (!length) {
        copy.length = start
        return copy
      }

      return copy.slice(start, start + length)
    }
  }
}
