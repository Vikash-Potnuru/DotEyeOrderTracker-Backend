const generateId = prefix => {
  const time = Date.now()
  const random = Math.floor(Math.random() * 10000)

  return `${prefix}-${time}-${random}`
}

module.exports = generateId
