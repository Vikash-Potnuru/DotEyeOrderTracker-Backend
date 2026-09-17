const ORDER_STATUSES = [
  'Placed',
  'Processing',
  'Shipped',
  'Delivered',
  'Disputed',
  'Cancelled',
]

const ORDER_STATUS_FLOW = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Disputed: [],
  Cancelled: [],
}

const DISPUTE_CATEGORIES = [
  'Damaged Item',
  'Item Not Received',
  'Wrong Product',
  'Other',
]

const DISPUTE_STATUSES = [
  'Open',
  'Under Review',
  'Resolved (Refunded)',
  'Resolved (Rejected)',
]

const isActiveDispute = status => {
  return status === 'Open' || status === 'Under Review'
}

const canRaiseDispute = status => {
  return status === 'Shipped' || status === 'Delivered'
}

module.exports = {
  ORDER_STATUSES,
  ORDER_STATUS_FLOW,
  DISPUTE_CATEGORIES,
  DISPUTE_STATUSES,
  isActiveDispute,
  canRaiseDispute,
}
