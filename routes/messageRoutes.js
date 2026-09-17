const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')
const {
  getMessages,
  getMessagesForAdmin,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController')

const router = express.Router()

router.get(
  '/:orderId/messages',
  authenticateUser,
  getMessages
)

router.get(
  '/messages/all',
  authenticateUser,
  authorizeRoles('Admin'),
  getMessagesForAdmin
)

router.post(
  '/:orderId/messages',
  authenticateUser,
  sendMessage
)

router.patch(
  '/:orderId/messages/read',
  authenticateUser,
  markAsRead
)

module.exports = router
