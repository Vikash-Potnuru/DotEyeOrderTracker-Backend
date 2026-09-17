const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')
const {
  getOrders,
  getMetadata,
  getMyOrders,
  getOrderById,
  getTimeline,
  createNewOrder,
  changeStatus,
  cancel,
} = require('../controllers/orderController')

const router = express.Router()

router.get('/', authenticateUser, getOrders)
router.get('/metadata', authenticateUser, getMetadata)
router.get('/my-orders', authenticateUser, authorizeRoles('Customer'), getMyOrders)
router.get('/:orderId/timeline', authenticateUser, getTimeline)
router.get('/:orderId', authenticateUser, getOrderById)

router.post(
  '/',
  authenticateUser,
  authorizeRoles('Customer', 'Admin'),
  createNewOrder
)

router.patch(
  '/:orderId/status',
  authenticateUser,
  authorizeRoles('Admin'),
  changeStatus
)

router.patch(
  '/:orderId/cancel',
  authenticateUser,
  authorizeRoles('Customer', 'Admin'),
  cancel
)

module.exports = router
