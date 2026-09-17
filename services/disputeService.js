const Dispute = require('../models/Dispute')
const Order = require('../models/Order')
const User = require('../models/User')
const {
  DISPUTE_CATEGORIES,
  DISPUTE_STATUSES,
  canRaiseDispute,
  isActiveDispute,
} = require('../constants/orderConstants')
const generateId = require('../utils/generateId')
const {
  createSystemMessage,
} = require('./messageService')
const {
  addDisputeLockToOrder,
  resolveDisputeOrder,
} = require('./orderService')

const toDisputeResponse = (dispute, order, customer) => {
  return {
    ...dispute.toObject(),
    customer: customer
      ? {id: customer.id, name: customer.name, email: customer.email}
      : null,
    order: order
      ? {id: order.id, customerId: order.customerId, customerName: order.customerName, status: order.status}
      : null,
    customerName: customer?.name || order?.customerName || '',
  }
}

const enrichDisputes = async disputes => {
  const orderIds = [...new Set(disputes.map(dispute => dispute.orderId))]
  const customerIds = [...new Set(disputes.map(dispute => dispute.raisedBy))]

  const [orders, customers] = await Promise.all([
    Order.find({id: {$in: orderIds}}).lean(),
    User.find({id: {$in: customerIds}}).select('id name email').lean(),
  ])

  const ordersById = new Map(orders.map(order => [order.id, order]))
  const customersById = new Map(customers.map(customer => [customer.id, customer]))

  return disputes.map(dispute =>
    toDisputeResponse(
      dispute,
      ordersById.get(dispute.orderId),
      customersById.get(dispute.raisedBy)
    )
  )
}

const createDispute = async (data, user) => {
  const order = await Order.findOne({id: data.orderId})

  if (!order) {
    throw new Error('Order not found.')
  }

  if (user.role === 'Customer' && order.customerId !== user.id) {
    const error = new Error('You do not have access to this order.')
    error.statusCode = 403
    throw error
  }

  if (!canRaiseDispute(order.status)) {
    throw new Error(
      'A dispute can only be raised for Shipped or Delivered orders.'
    )
  }

  const existingDispute = await Dispute.findOne({
    orderId: order.id,
    status: {$in: ['Open', 'Under Review']},
  })

  if (existingDispute) {
    throw new Error('This order already has an active dispute.')
  }

  if (!DISPUTE_CATEGORIES.includes(data.reasonCategory)) {
    throw new Error('Invalid dispute reason category.')
  }

  const description = String(data.description || '').trim()

  if (description.length < 20 || description.length > 500) {
    throw new Error(
      'Dispute description must be between 20 and 500 characters.'
    )
  }

  const dispute = await Dispute.create({
    id: generateId('DSP'),
    orderId: order.id,
    raisedBy: user.id,
    reasonCategory: data.reasonCategory,
    description,
    status: 'Open',
    adminResolutionNotes: '',
  })

  await addDisputeLockToOrder(order, user)

  const systemMessage = await createSystemMessage(
    order.id,
    'A dispute has been opened for this order.'
  )

  return {
    dispute: (await enrichDisputes([dispute]))[0],
    order: await Order.findOne({id: order.id}),
    systemMessage,
  }
}

const getDisputesForUser = async user => {
  const disputes = user.role === 'Admin'
    ? await Dispute.find().sort({createdAt: -1})
    : await Dispute.find({raisedBy: user.id}).sort({createdAt: -1})

  return enrichDisputes(disputes)
}

const getDisputeForUser = async (disputeId, user) => {
  const dispute = await Dispute.findOne({id: disputeId})

  if (!dispute) {
    throw new Error('Dispute not found.')
  }

  if (user.role === 'Customer' && dispute.raisedBy !== user.id) {
    const error = new Error('You do not have access to this dispute.')
    error.statusCode = 403
    throw error
  }

  return (await enrichDisputes([dispute]))[0]
}

const updateDisputeStatus = async (
  disputeId,
  status,
  adminResolutionNotes = ''
) => {
  if (!DISPUTE_STATUSES.includes(status)) {
    throw new Error('Invalid dispute status.')
  }

  const dispute = await Dispute.findOne({id: disputeId})

  if (!dispute) {
    throw new Error('Dispute not found.')
  }

  if (status === 'Under Review' && dispute.status !== 'Open') {
    throw new Error(
      'Only an Open dispute can move to Under Review.'
    )
  }

  const resolving =
    status === 'Resolved (Refunded)' ||
    status === 'Resolved (Rejected)'

  if (resolving && dispute.status !== 'Under Review') {
    throw new Error(
      'A dispute must be Under Review before it can be resolved.'
    )
  }

  dispute.status = status
  dispute.adminResolutionNotes = String(adminResolutionNotes || '').trim()

  await dispute.save()

  const order = await Order.findOne({id: dispute.orderId})

  if (!order) {
    throw new Error('Parent order not found.')
  }

  let updatedOrder = order
  let systemMessage

  if (isActiveDispute(status)) {
    systemMessage = await createSystemMessage(
      dispute.orderId,
      `Dispute status changed to ${status}.`
    )
  } else {
    updatedOrder = await resolveDisputeOrder(order, status)

    systemMessage = await createSystemMessage(
      dispute.orderId,
      `Dispute resolved as ${status}.`
    )
  }

  return {
    dispute: (await enrichDisputes([dispute]))[0],
    order: updatedOrder,
    systemMessage,
  }
}

module.exports = {
  createDispute,
  getDisputesForUser,
  getDisputeForUser,
  updateDisputeStatus,
}
