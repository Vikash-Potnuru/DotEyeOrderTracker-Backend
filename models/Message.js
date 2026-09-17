const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: String,
      default: null,
    },

    senderName: {
      type: String,
      required: true,
      default: 'System',
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    isSystemMessage: {
      type: Boolean,
      default: false,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

messageSchema.index({orderId: 1, timestamp: 1})

module.exports = mongoose.model('Message', messageSchema)
