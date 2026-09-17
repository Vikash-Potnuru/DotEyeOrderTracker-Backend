const {
  createDispute,
  getDisputesForUser,
  getDisputeForUser,
  updateDisputeStatus,
} = require('../services/disputeService')
const {emitToOrderRoom} = require('../socket/socket')

const create = async (req, res) => {
  const result = await createDispute(req.body, req.user)

  emitToOrderRoom(result.order.id, 'order-status-updated', {
    orderId: result.order.id,
    status: result.order.status,
    order: result.order,
    timelineEvent:
      result.order.timelineHistory[
        result.order.timelineHistory.length - 1
      ],
  })

  emitToOrderRoom(result.order.id, 'new-message', {
    message: result.systemMessage,
  })

  emitToOrderRoom(result.order.id, 'dispute-updated', {
    dispute: result.dispute,
  })

  res.status(201).json({
    message: 'Dispute created successfully.',
    dispute: result.dispute,
    order: result.order,
    systemMessage: result.systemMessage,
  })
}

const getAll = async (req, res) => {
  const disputes = await getDisputesForUser(req.user)

  res.json({
    disputes,
  })
}

const getById = async (req, res) => {
  const dispute = await getDisputeForUser(
    req.params.disputeId,
    req.user
  )

  res.json({
    dispute,
  })
}

const updateStatus = async (req, res) => {
  const {status, adminResolutionNotes} = req.body

  const result = await updateDisputeStatus(
    req.params.disputeId,
    status,
    adminResolutionNotes || ''
  )

  emitToOrderRoom(result.order.id, 'dispute-updated', {
    dispute: result.dispute,
  })

  emitToOrderRoom(result.order.id, 'order-status-updated', {
    orderId: result.order.id,
    status: result.order.status,
    order: result.order,
    timelineEvent:
      result.order.timelineHistory[
        result.order.timelineHistory.length - 1
      ],
  })

  emitToOrderRoom(result.order.id, 'new-message', {
    message: result.systemMessage,
  })

  res.json({
    message: 'Dispute status updated successfully.',
    dispute: result.dispute,
    order: result.order,
    systemMessage: result.systemMessage,
  })
}

module.exports = {
  create,
  getAll,
  getById,
  updateStatus,
}
