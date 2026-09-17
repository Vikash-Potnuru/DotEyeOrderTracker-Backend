const Order = require('../models/Order')
const {
  getOrderForUser,
  getOrdersForUser,
  getOrdersWithFilters,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../services/orderService')
const {emitToOrderRoom} = require('../socket/socket')
const {getOrderMetadata} = require('../services/orderMetadataService')

const getMetadata = async (req, res) => {
  res.json(getOrderMetadata())
}

const getOrders = async (req, res) => {
  if (req.user.role === 'Admin') {
    const result = await getOrdersWithFilters(req.query)

    return res.json(result)
  }

  const orders = await getOrdersForUser(req.user)

  res.json({
    orders,
    pagination: {
      page: 1,
      limit: orders.length,
      total: orders.length,
      totalPages: 1,
    },
  })
}

const getMyOrders = async (req, res) => {
  const orders = await getOrdersForUser(req.user)

  res.json({
    orders,
  })
}

const getOrderById = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user)

  res.json({
    order,
  })
}

const getTimeline = async (req, res) => {
  const order = await getOrderForUser(req.params.orderId, req.user)

  res.json({
    timelineHistory: order.timelineHistory,
  })
}

const createNewOrder = async (req, res) => {
  const order = await createOrder(req.body, req.user)

  res.status(201).json({
    message: 'Order created successfully.',
    order,
  })
}

const changeStatus = async (req, res) => {
  const {status, note} = req.body

  if (!status) {
    return res.status(400).json({
      message: 'New order status is required.',
    })
  }

  const result = await updateOrderStatus(
    req.params.orderId,
    status,
    note || ''
  )

  emitToOrderRoom(req.params.orderId, 'order-status-updated', {
    orderId: req.params.orderId,
    status: result.order.status,
    order: result.order,
    timelineEvent: result.timelineEvent,
  })

  emitToOrderRoom(req.params.orderId, 'new-message', {
    message: result.systemMessage,
  })

  res.json({
    message: 'Order status updated successfully.',
    order: result.order,
    timelineEvent: result.timelineEvent,
    systemMessage: result.systemMessage,
  })
}

const cancel = async (req, res) => {
  const result = await cancelOrder(
    req.params.orderId,
    req.user,
    req.body.note || ''
  )

  emitToOrderRoom(req.params.orderId, 'order-status-updated', {
    orderId: req.params.orderId,
    status: result.order.status,
    order: result.order,
    timelineEvent: result.timelineEvent,
  })

  emitToOrderRoom(req.params.orderId, 'new-message', {
    message: result.systemMessage,
  })

  res.json({
    message: 'Order cancelled successfully.',
    order: result.order,
    timelineEvent: result.timelineEvent,
    systemMessage: result.systemMessage,
  })
}

module.exports = {
  getMetadata,
  getOrders,
  getMyOrders,
  getOrderById,
  getTimeline,
  createNewOrder,
  changeStatus,
  cancel,
}
