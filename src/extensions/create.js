module.exports = {
  name: 'create',
  func: (data, schema) => {
    return (name, props) => {
      var number =
        Math.max.apply(
          Math,
          data[schema.name].map(o => Number(o.id.toString().match(/\d+/)[0]))
        ) + 1

      name = name
        .replace(/^.*\/\/[^\/]+/, '')
        .replace(/([^\/a-z0-9]+)/gi, '-')
        .toLowerCase()

      return Object.assign(
        {},
        {
          id: `${number}-${name}`,
          number,
          name
        },
        props || {}
      )
    }
  }
}
