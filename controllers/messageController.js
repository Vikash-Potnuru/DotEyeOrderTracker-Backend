const {
  getMessagesByOrder,
  getAllMessages,
  createUserMessage,
  markOrderMessagesAsRead,
} = require('../services/messageService')
const {getOrderForUser} = require('../services/orderService')
const {emitToOrderRoom} = require('../socket/socket')

const getMessages = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user)

  const messages = await getMessagesByOrder(req.params.orderId)

  res.json({
    messages,
  })
}

const getMessagesForAdmin = async (req, res) => {
  const messages = await getAllMessages()

  res.json({
    messages,
  })
}

const sendMessage = async (req, res) => {
  const content = String(req.body.content || '').trim()

  if (!content) {
    return res.status(400).json({
      message: 'Message content is required.',
    })
  }

  if (content.length > 2000) {
    return res.status(400).json({
      message: 'Message cannot exceed 2000 characters.',
    })
  }

  await getOrderForUser(req.params.orderId, req.user)

  const message = await createUserMessage(
    req.params.orderId,
    req.user,
    content
  )

  emitToOrderRoom(req.params.orderId, 'new-message', {
    message,
  })

  res.status(201).json({
    message,
  })
}

const markAsRead = async (req, res) => {
  await getOrderForUser(req.params.orderId, req.user)

  const messages = await markOrderMessagesAsRead(req.params.orderId)

  emitToOrderRoom(req.params.orderId, 'messages-read', {
    orderId: req.params.orderId,
  })

  res.json({
    messages,
  })
}

module.exports = {
  getMessages,
  getMessagesForAdmin,
  sendMessage,
  markAsRead,
}
