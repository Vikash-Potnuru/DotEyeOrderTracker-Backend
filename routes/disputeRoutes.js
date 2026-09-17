const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')
const {
  create,
  getAll,
  getById,
  updateStatus,
} = require('../controllers/disputeController')

const router = express.Router()

router.post(
  '/',
  authenticateUser,
  authorizeRoles('Customer'),
  create
)

router.get(
  '/',
  authenticateUser,
  getAll
)

router.get(
  '/my-disputes',
  authenticateUser,
  authorizeRoles('Customer'),
  getAll
)

router.get(
  '/:disputeId',
  authenticateUser,
  getById
)

router.patch(
  '/:disputeId/status',
  authenticateUser,
  authorizeRoles('Admin'),
  updateStatus
)

module.exports = router
