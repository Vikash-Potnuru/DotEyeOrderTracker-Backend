const {
  getCustomerDashboard,
  getAdminDashboard,
} = require('../services/dashboardService')

const customerDashboard = async (req, res) => {
  const dashboard = await getCustomerDashboard(req.user)

  res.json({
    dashboard,
  })
}

const adminDashboard = async (req, res) => {
  const dashboard = await getAdminDashboard()

  res.json({
    dashboard,
  })
}

module.exports = {
  customerDashboard,
  adminDashboard,
}
