const express = require('express')
const authenticateUser = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')
const {
  customerDashboard,
  adminDashboard,
} = require('../controllers/dashboardController')

const router = express.Router()

router.get(
  '/customer',
  authenticateUser,
  authorizeRoles('Customer'),
  customerDashboard
)

router.get(
  '/admin',
  authenticateUser,
  authorizeRoles('Admin'),
  adminDashboard
)

module.exports = router
