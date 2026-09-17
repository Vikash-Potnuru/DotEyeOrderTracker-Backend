const {
  ORDER_STATUSES,
  ORDER_STATUS_FLOW,
  DISPUTE_CATEGORIES,
  DISPUTE_STATUSES,
  isActiveDispute,
  canRaiseDispute,
} = require('../constants/orderConstants')

const getOrderMetadata = () => ({
  orderStatuses: [...ORDER_STATUSES],
  statusFlow: Object.fromEntries(
    Object.entries(ORDER_STATUS_FLOW).map(([status, nextStatuses]) => [
      status,
      [...nextStatuses],
    ])
  ),
  disputeCategories: [...DISPUTE_CATEGORIES],
  disputeStatuses: [...DISPUTE_STATUSES],
  activeDisputeStatuses: DISPUTE_STATUSES.filter(isActiveDispute),
  disputeEligibleOrderStatuses: ORDER_STATUSES.filter(canRaiseDispute),
})

module.exports = {
  getOrderMetadata,
}
