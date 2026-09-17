const Order = require('../models/Order')
const User = require('../models/User')
const Dispute = require('../models/Dispute')
const {
  ORDER_STATUS_FLOW,
  isActiveDispute,
} = require('../constants/orderConstants')
const generateId = require('../utils/generateId')
const {createSystemMessage} = require('./messageService')

const getOrderForUser = async (orderId, user) => {
  const order = await Order.findOne({id: orderId})

  if (!order) {
    throw new Error('Order not found.')
  }

  if (user.role === 'Customer' && order.customerId !== user.id) {
    const error = new Error('You do not have access to this order.')
    error.statusCode = 403
    throw error
  }

  return order
}

const getOrdersForUser = async user => {
  if (user.role === 'Admin') {
    return Order.find().sort({orderDate: -1})
  }

  return Order.find({customerId: user.id}).sort({orderDate: -1})
}

const getOrdersWithFilters = async query => {
  const {search = '', status = '', page = 1, limit = 10} = query

  const pageNumber = Math.max(Number(page) || 1, 1)
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100)

  const filter = {}

  if (status) {
    filter.status = status
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i')

    filter.$or = [
      {id: searchRegex},
      {customerId: searchRegex},
      {customerName: searchRegex},
    ]
  }

  const total = await Order.countDocuments(filter)

  const orders = await Order.find(filter)
    .sort({orderDate: -1})
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)

  return {
    orders,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  }
}

const createOrder = async (data, user) => {
  const customer = await User.findOne({
    id: user.role === 'Admin' && data.customerId ? data.customerId : user.id,
    role: 'Customer',
  })

  if (!customer) {
    throw new Error('Customer not found.')
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('At least one order item is required.')
  }

  const items = data.items.map((item, index) => ({
    id: item.id || `I-${Date.now()}-${index + 1}`,
    name: item.name,
    quantity: Number(item.quantity),
    price: Number(item.price),
  }))

  const invalidItem = items.find(
    item =>
      !item.name ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      Number.isNaN(item.price) ||
      item.price < 0
  )

  if (invalidItem) {
    throw new Error('Invalid order item data.')
  }

  const totalAmount = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  )

  const now = new Date()

  const order = await Order.create({
    id: generateId('ORD'),
    customerId: customer.id,
    customerName: customer.name,
    orderDate: now,
    items,
    totalAmount,
    status: 'Placed',
    timelineHistory: [
      {
        id: generateId('TL'),
        status: 'Placed',
        updatedBy: 'Customer',
        timestamp: now,
        note: 'Order placed successfully.',
      },
    ],
  })

  return order
}

const updateOrderStatus = async (orderId, newStatus, note = '') => {
  const order = await Order.findOne({id: orderId})

  if (!order) {
    throw new Error('Order not found.')
  }

  if (isActiveDispute(order.status)) {
    const error = new Error(
      'Order progression is locked because a dispute is active.'
    )
    error.statusCode = 400
    throw error
  }

  const nextStatuses = ORDER_STATUS_FLOW[order.status] || []

  if (!nextStatuses.includes(newStatus)) {
    const error = new Error(
      `${order.status} cannot be changed to ${newStatus}.`
    )
    error.statusCode = 400
    throw error
  }

  const timelineEvent = {
    id: generateId('TL'),
    status: newStatus,
    updatedBy: 'Admin',
    timestamp: new Date(),
    note: note.trim() || `Order status changed to ${newStatus}.`,
  }

  order.status = newStatus
  order.timelineHistory.push(timelineEvent)

  await order.save()

  const systemMessage = await createSystemMessage(
    order.id,
    `Order status changed to ${newStatus}.`
  )

  return {
    order,
    timelineEvent,
    systemMessage,
  }
}

const cancelOrder = async (orderId, user, note = '') => {
  const order = await getOrderForUser(orderId, user)

  if (!['Placed', 'Processing'].includes(order.status)) {
    throw new Error(
      'Only Placed or Processing orders can be cancelled.'
    )
  }

  const timelineEvent = {
    id: generateId('TL'),
    status: 'Cancelled',
    updatedBy: user.role === 'Admin' ? 'Admin' : 'Customer',
    timestamp: new Date(),
    note: note.trim() || 'Order cancelled.',
  }

  order.status = 'Cancelled'
  order.timelineHistory.push(timelineEvent)

  await order.save()

  const systemMessage = await createSystemMessage(
    order.id,
    'Order has been cancelled.'
  )

  return {
    order,
    timelineEvent,
    systemMessage,
  }
}

const addDisputeLockToOrder = async (order, user) => {
  const previousStatus = order.status

  order.statusBeforeDispute = previousStatus
  order.status = 'Disputed'

  order.timelineHistory.push({
    id: generateId('TL'),
    status: 'Disputed',
    updatedBy: user.role === 'Admin' ? 'Admin' : 'Customer',
    timestamp: new Date(),
    note: 'Customer opened a dispute. Normal order progression is locked.',
  })

  await order.save()

  return order
}

const resolveDisputeOrder = async (order, disputeStatus) => {
  const finalStatus = 'Delivered'

  order.status = finalStatus
  order.statusBeforeDispute = null

  order.timelineHistory.push({
    id: generateId('TL'),
    status: finalStatus,
    updatedBy: 'Admin',
    timestamp: new Date(),
    note: `Dispute resolved as ${disputeStatus}. Order workflow is unlocked.`,
  })

  await order.save()

  return order
}

const getOrderDispute = async orderId => {
  return Dispute.findOne({
    orderId,
    status: {$in: ['Open', 'Under Review']},
  })
}

module.exports = {
  getOrderForUser,
  getOrdersForUser,
  getOrdersWithFilters,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  addDisputeLockToOrder,
  resolveDisputeOrder,
  getOrderDispute,
}
