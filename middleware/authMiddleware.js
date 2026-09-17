const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticateUser = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication token is required.',
      })
    }

    const token = authorization.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findOne({id: decoded.userId}).select('-passwordHash')

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists.',
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    })
  }
}

module.exports = authenticateUser
