const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['Customer', 'Admin'],
      default: 'Customer',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)
