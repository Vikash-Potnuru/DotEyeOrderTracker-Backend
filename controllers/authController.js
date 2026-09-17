const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateId = require('../utils/generateId')
const generateToken = require('../utils/generateToken')

const formatUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
})

const register = async (req, res) => {
  const {name, email, password} = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email and password are required.',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must contain at least 6 characters.',
    })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existingUser = await User.findOne({email: normalizedEmail})

  if (existingUser) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    id: generateId('USR'),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'Customer',
  })

  const token = generateToken(user)

  res.status(201).json({
    message: 'User registered successfully.',
    user: formatUser(user),
    token,
  })
}

const login = async (req, res) => {
  const {email, password} = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    })
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  })

  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password.',
    })
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  )

  if (!passwordMatches) {
    return res.status(401).json({
      message: 'Invalid email or password.',
    })
  }

  const token = generateToken(user)

  res.json({
    message: 'Login successful.',
    user: formatUser(user),
    token,
  })
}

const getCurrentUser = async (req, res) => {
  res.json({
    user: formatUser(req.user),
  })
}

module.exports = {
  register,
  login,
  getCurrentUser,
}
