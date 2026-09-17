const Message = require('../models/Message')
const Order = require('../models/Order')
const generateId = require('../utils/generateId')

const getMessagesByOrder = async orderId => {
  return Message.find({orderId}).sort({timestamp: 1})
}

const createUserMessage = async (orderId, user, content) => {
  const order = await Order.findOne({id: orderId})

  if (!order) {
    throw new Error('Order not found.')
  }

  const message = await Message.create({
    id: generateId('MSG'),
    orderId,
    senderId: user.id,
    senderName: user.name,
    content: content.trim(),
    isSystemMessage: false,
    timestamp: new Date(),
    isRead: false,
  })

  return message
}

const createSystemMessage = async (orderId, content) => {
  const message = await Message.create({
    id: generateId('SYS'),
    orderId,
    senderId: null,
    senderName: 'System',
    content,
    isSystemMessage: true,
    timestamp: new Date(),
    isRead: true,
  })

  return message
}

const markOrderMessagesAsRead = async orderId => {
  await Message.updateMany(
    {
      orderId,
      isSystemMessage: false,
    },
    {
      $set: {isRead: true},
    }
  )

  return getMessagesByOrder(orderId)
}

const getAllMessages = async () => {
  return Message.find().sort({timestamp: 1})
}

module.exports = {
  getMessagesByOrder,
  createUserMessage,
  createSystemMessage,
  markOrderMessagesAsRead,
  getAllMessages,
}
