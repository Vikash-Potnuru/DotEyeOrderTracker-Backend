const Order = require('../models/Order')
const Dispute = require('../models/Dispute')
const Message = require('../models/Message')

const getCustomerDashboard = async user => {
  const orders = await Order.find({customerId: user.id}).sort({orderDate: -1})
  const disputes = await Dispute.find({raisedBy: user.id}).sort({createdAt: -1})

  return {
    totalOrders: orders.length,
    processingOrders: orders.filter(
      order => order.status === 'Processing'
    ).length,
    shippedOrders: orders.filter(order => order.status === 'Shipped').length,
    deliveredOrders: orders.filter(
      order => order.status === 'Delivered'
    ).length,
    activeDisputes: disputes.filter(dispute =>
      ['Open', 'Under Review'].includes(dispute.status)
    ).length,
    recentOrders: orders.slice(0, 5),
  }
}

const getAdminDashboard = async () => {
  const [
    totalOrders,
    placedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    activeDisputes,
    recentOrders,
    recentDisputes,
    recentMessages,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({status: 'Placed'}),
    Order.countDocuments({status: 'Processing'}),
    Order.countDocuments({status: 'Shipped'}),
    Order.countDocuments({status: 'Delivered'}),
    Dispute.countDocuments({
      status: {$in: ['Open', 'Under Review']},
    }),
    Order.find().sort({orderDate: -1}).limit(5),
    Dispute.find().sort({createdAt: -1}).limit(5),
    Message.find().sort({timestamp: -1}).limit(5),
  ])

  return {
    totalOrders,
    pendingOrders: placedOrders + processingOrders,
    placedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    activeDisputes,
    recentOrders,
    recentDisputes,
    recentMessages,
  }
}

module.exports = {
  getCustomerDashboard,
  getAdminDashboard,
}
