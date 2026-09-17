const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')

dotenv.config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Order = require('../models/Order')
const Message = require('../models/Message')
const Dispute = require('../models/Dispute')

const users = [
  {id: 'USR-001', name: 'Vikash Potnuru', email: 'vikash@example.com', role: 'Customer'},
  {id: 'USR-002', name: 'Ananya Rao', email: 'ananya@example.com', role: 'Customer'},
  {id: 'USR-003', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Customer'},
  {id: 'USR-004', name: 'Priya Reddy', email: 'priya@example.com', role: 'Customer'},
  {id: 'USR-005', name: 'Arjun Kumar', email: 'arjun@example.com', role: 'Customer'},
  {id: 'USR-006', name: 'Meera Nair', email: 'meera@example.com', role: 'Customer'},
  {id: 'USR-ADMIN', name: 'DotEye Support Admin', email: 'admin@doteyelabs.com', role: 'Admin'},
]

const orders = [
  {
    id: 'ORD-1001', customerId: 'USR-001', customerName: 'Vikash Potnuru', orderDate: '2026-08-21T09:20:00',
    items: [{id: 'I-1001', name: 'Wireless Keyboard', quantity: 1, price: 2499}, {id: 'I-1002', name: 'USB-C Hub', quantity: 1, price: 1299}],
    totalAmount: 3798, status: 'Processing',
    timelineHistory: [
      {id: 'TL-1001-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-21T09:20:00', note: 'Order placed successfully.'},
      {id: 'TL-1001-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-21T10:10:00', note: 'Payment confirmed and order is being prepared.'},
    ],
  },
  {
    id: 'ORD-1002', customerId: 'USR-001', customerName: 'Vikash Potnuru', orderDate: '2026-08-18T12:15:00',
    items: [{id: 'I-1003', name: 'Mechanical Keyboard', quantity: 1, price: 4599}, {id: 'I-1004', name: 'Desk Mat', quantity: 1, price: 899}],
    totalAmount: 5498, status: 'Shipped',
    timelineHistory: [
      {id: 'TL-1002-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-18T12:15:00', note: 'Order placed successfully.'},
      {id: 'TL-1002-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-18T13:05:00', note: 'Order accepted by warehouse.'},
      {id: 'TL-1002-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-19T16:40:00', note: 'Package handed over to delivery partner.'},
    ],
  },
  {
    id: 'ORD-1003', customerId: 'USR-001', customerName: 'Vikash Potnuru', orderDate: '2026-08-12T15:30:00',
    items: [{id: 'I-1005', name: 'Bluetooth Headphones', quantity: 1, price: 3299}], totalAmount: 3299, status: 'Delivered',
    timelineHistory: [
      {id: 'TL-1003-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-12T15:30:00', note: 'Order placed successfully.'},
      {id: 'TL-1003-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-12T16:20:00', note: 'Order accepted by warehouse.'},
      {id: 'TL-1003-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-13T11:30:00', note: 'Package shipped.'},
      {id: 'TL-1003-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-15T14:10:00', note: 'Package delivered successfully.'},
    ],
  },
  {
    id: 'ORD-1004', customerId: 'USR-001', customerName: 'Vikash Potnuru', orderDate: '2026-08-10T11:00:00',
    items: [{id: 'I-1006', name: 'Monitor Stand', quantity: 1, price: 1799}, {id: 'I-1007', name: 'Laptop Sleeve', quantity: 1, price: 1199}],
    totalAmount: 2998, status: 'Disputed', statusBeforeDispute: 'Shipped',
    timelineHistory: [
      {id: 'TL-1004-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-10T11:00:00', note: 'Order placed successfully.'},
      {id: 'TL-1004-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-10T12:00:00', note: 'Order is being prepared.'},
      {id: 'TL-1004-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-11T09:20:00', note: 'Package shipped.'},
      {id: 'TL-1004-4', status: 'Disputed', updatedBy: 'Customer', timestamp: '2026-08-14T18:00:00', note: 'Customer raised a dispute. Normal progression is locked.'},
    ],
  },
  {
    id: 'ORD-1005', customerId: 'USR-001', customerName: 'Vikash Potnuru', orderDate: '2026-08-05T10:40:00',
    items: [{id: 'I-1008', name: 'Smart Watch', quantity: 1, price: 5999}], totalAmount: 5999, status: 'Cancelled',
    timelineHistory: [
      {id: 'TL-1005-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-05T10:40:00', note: 'Order placed successfully.'},
      {id: 'TL-1005-2', status: 'Cancelled', updatedBy: 'Customer', timestamp: '2026-08-05T13:00:00', note: 'Order cancelled before processing.'},
    ],
  },
  {
    id: 'ORD-1006', customerId: 'USR-002', customerName: 'Ananya Rao', orderDate: '2026-08-20T08:50:00',
    items: [{id: 'I-1009', name: 'Web Camera', quantity: 1, price: 2999}], totalAmount: 2999, status: 'Placed',
    timelineHistory: [{id: 'TL-1006-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-20T08:50:00', note: 'Order placed successfully.'}],
  },
  {
    id: 'ORD-1007', customerId: 'USR-002', customerName: 'Ananya Rao', orderDate: '2026-08-17T14:00:00',
    items: [{id: 'I-1010', name: 'Portable SSD', quantity: 1, price: 4899}, {id: 'I-1011', name: 'USB Cable', quantity: 2, price: 399}], totalAmount: 5697, status: 'Processing',
    timelineHistory: [
      {id: 'TL-1007-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-17T14:00:00', note: 'Order placed successfully.'},
      {id: 'TL-1007-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-17T15:10:00', note: 'Order is being prepared.'},
    ],
  },
  {
    id: 'ORD-1008', customerId: 'USR-003', customerName: 'Rahul Sharma', orderDate: '2026-08-14T16:30:00',
    items: [{id: 'I-1012', name: 'Gaming Mouse', quantity: 1, price: 2199}], totalAmount: 2199, status: 'Shipped',
    timelineHistory: [
      {id: 'TL-1008-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-14T16:30:00', note: 'Order placed successfully.'},
      {id: 'TL-1008-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-14T17:20:00', note: 'Order accepted by warehouse.'},
      {id: 'TL-1008-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-15T10:30:00', note: 'Package shipped.'},
    ],
  },
  {
    id: 'ORD-1009', customerId: 'USR-003', customerName: 'Rahul Sharma', orderDate: '2026-08-08T13:20:00',
    items: [{id: 'I-1013', name: 'Laptop Backpack', quantity: 1, price: 2499}], totalAmount: 2499, status: 'Delivered',
    timelineHistory: [
      {id: 'TL-1009-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-08T13:20:00', note: 'Order placed successfully.'},
      {id: 'TL-1009-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-08T14:10:00', note: 'Order is being prepared.'},
      {id: 'TL-1009-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-09T09:10:00', note: 'Package shipped.'},
      {id: 'TL-1009-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-11T17:30:00', note: 'Package delivered successfully.'},
    ],
  },
  {
    id: 'ORD-1010', customerId: 'USR-003', customerName: 'Rahul Sharma', orderDate: '2026-08-02T09:10:00',
    items: [{id: 'I-1014', name: 'Bluetooth Speaker', quantity: 1, price: 2799}, {id: 'I-1015', name: 'AUX Cable', quantity: 1, price: 299}], totalAmount: 3098, status: 'Delivered',
    timelineHistory: [
      {id: 'TL-1010-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-02T09:10:00', note: 'Order placed successfully.'},
      {id: 'TL-1010-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-02T10:00:00', note: 'Order is being prepared.'},
      {id: 'TL-1010-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-03T08:45:00', note: 'Package shipped.'},
      {id: 'TL-1010-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-05T13:40:00', note: 'Package delivered successfully.'},
    ],
  },
  {
    id: 'ORD-1011', customerId: 'USR-004', customerName: 'Priya Reddy', orderDate: '2026-08-22T10:15:00',
    items: [{id: 'I-1016', name: 'Noise Cancelling Earbuds', quantity: 1, price: 3999}], totalAmount: 3999, status: 'Processing',
    timelineHistory: [
      {id: 'TL-1011-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-22T10:15:00', note: 'Order placed successfully.'},
      {id: 'TL-1011-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-22T11:05:00', note: 'Payment confirmed and order is being prepared.'},
    ],
  },
  {
    id: 'ORD-1012', customerId: 'USR-004', customerName: 'Priya Reddy', orderDate: '2026-08-16T09:40:00',
    items: [{id: 'I-1017', name: 'Laptop Stand', quantity: 1, price: 2499}, {id: 'I-1018', name: 'Wireless Mouse', quantity: 1, price: 1599}], totalAmount: 4098, status: 'Shipped',
    timelineHistory: [
      {id: 'TL-1012-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-16T09:40:00', note: 'Order placed successfully.'},
      {id: 'TL-1012-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-16T10:30:00', note: 'Order accepted by warehouse.'},
      {id: 'TL-1012-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-17T08:15:00', note: 'Package handed over to delivery partner.'},
    ],
  },
  {
    id: 'ORD-1013', customerId: 'USR-004', customerName: 'Priya Reddy', orderDate: '2026-08-03T12:20:00',
    items: [{id: 'I-1019', name: 'Smartphone Tripod', quantity: 1, price: 1899}], totalAmount: 1899, status: 'Delivered',
    timelineHistory: [
      {id: 'TL-1013-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-03T12:20:00', note: 'Order placed successfully.'},
      {id: 'TL-1013-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-03T13:00:00', note: 'Order is being prepared.'},
      {id: 'TL-1013-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-04T08:00:00', note: 'Package shipped.'},
      {id: 'TL-1013-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-06T15:30:00', note: 'Package delivered successfully.'},
    ],
  },
  {
    id: 'ORD-1014', customerId: 'USR-005', customerName: 'Arjun Kumar', orderDate: '2026-08-23T11:05:00',
    items: [{id: 'I-1020', name: 'Mechanical Gaming Keyboard', quantity: 1, price: 5299}], totalAmount: 5299, status: 'Placed',
    timelineHistory: [{id: 'TL-1014-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-23T11:05:00', note: 'Order placed successfully.'}],
  },
  {
    id: 'ORD-1015', customerId: 'USR-005', customerName: 'Arjun Kumar', orderDate: '2026-08-19T16:00:00',
    items: [{id: 'I-1021', name: '4K Monitor', quantity: 1, price: 24999}], totalAmount: 24999, status: 'Shipped',
    timelineHistory: [
      {id: 'TL-1015-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-19T16:00:00', note: 'Order placed successfully.'},
      {id: 'TL-1015-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-19T17:00:00', note: 'Order accepted by warehouse.'},
      {id: 'TL-1015-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-20T09:30:00', note: 'Package shipped.'},
    ],
  },
  {
    id: 'ORD-1016', customerId: 'USR-005', customerName: 'Arjun Kumar', orderDate: '2026-08-01T10:00:00',
    items: [{id: 'I-1022', name: 'USB Microphone', quantity: 1, price: 6499}], totalAmount: 6499, status: 'Delivered',
    timelineHistory: [
      {id: 'TL-1016-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-01T10:00:00', note: 'Order placed successfully.'},
      {id: 'TL-1016-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-01T11:00:00', note: 'Order is being prepared.'},
      {id: 'TL-1016-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-02T09:30:00', note: 'Package shipped.'},
      {id: 'TL-1016-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-04T14:20:00', note: 'Package delivered successfully.'},
    ],
  },
  {
    id: 'ORD-1017', customerId: 'USR-006', customerName: 'Meera Nair', orderDate: '2026-08-24T09:30:00',
    items: [{id: 'I-1023', name: 'Tablet Keyboard', quantity: 1, price: 3499}], totalAmount: 3499, status: 'Processing',
    timelineHistory: [
      {id: 'TL-1017-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-24T09:30:00', note: 'Order placed successfully.'},
      {id: 'TL-1017-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-24T10:20:00', note: 'Payment confirmed and order is being prepared.'},
    ],
  },
  {
    id: 'ORD-1018', customerId: 'USR-006', customerName: 'Meera Nair', orderDate: '2026-08-07T14:45:00',
    items: [{id: 'I-1024', name: 'Fitness Smart Band', quantity: 1, price: 2299}], totalAmount: 2299, status: 'Disputed', statusBeforeDispute: 'Delivered',
    timelineHistory: [
      {id: 'TL-1018-1', status: 'Placed', updatedBy: 'Customer', timestamp: '2026-08-07T14:45:00', note: 'Order placed successfully.'},
      {id: 'TL-1018-2', status: 'Processing', updatedBy: 'System', timestamp: '2026-08-07T15:30:00', note: 'Order is being prepared.'},
      {id: 'TL-1018-3', status: 'Shipped', updatedBy: 'Admin', timestamp: '2026-08-08T09:00:00', note: 'Package shipped.'},
      {id: 'TL-1018-4', status: 'Delivered', updatedBy: 'System', timestamp: '2026-08-10T13:30:00', note: 'Package delivered successfully.'},
      {id: 'TL-1018-5', status: 'Disputed', updatedBy: 'Customer', timestamp: '2026-08-11T10:00:00', note: 'Customer reported an issue after delivery. Normal progression is locked.'},
    ],
  },
]

const messages = [
  {id: 'MSG-001', orderId: 'ORD-1002', senderId: null, senderName: 'System', content: 'Order status changed to Shipped.', isSystemMessage: true, timestamp: '2026-08-19T16:40:00', isRead: true},
  {id: 'MSG-002', orderId: 'ORD-1002', senderId: 'USR-001', senderName: 'Vikash Potnuru', content: 'Hi, when can I expect my order?', isSystemMessage: false, timestamp: '2026-08-19T17:00:00', isRead: true},
  {id: 'MSG-003', orderId: 'ORD-1002', senderId: 'USR-ADMIN', senderName: 'DotEye Support Admin', content: 'Your package is currently in transit. It should arrive soon.', isSystemMessage: false, timestamp: '2026-08-19T17:08:00', isRead: false},
  {id: 'MSG-004', orderId: 'ORD-1004', senderId: null, senderName: 'System', content: 'A dispute has been opened for this order.', isSystemMessage: true, timestamp: '2026-08-14T18:00:00', isRead: true},
  {id: 'MSG-005', orderId: 'ORD-1004', senderId: 'USR-001', senderName: 'Vikash Potnuru', content: 'The item arrived damaged. Please help me with a resolution.', isSystemMessage: false, timestamp: '2026-08-14T18:02:00', isRead: true},
  {id: 'MSG-006', orderId: 'ORD-1004', senderId: 'USR-ADMIN', senderName: 'DotEye Support Admin', content: 'Thanks for reporting this. I am reviewing the case.', isSystemMessage: false, timestamp: '2026-08-15T10:25:00', isRead: true},
  {id: 'MSG-007', orderId: 'ORD-1008', senderId: 'USR-003', senderName: 'Rahul Sharma', content: 'Can you confirm that my package has been shipped?', isSystemMessage: false, timestamp: '2026-08-15T11:00:00', isRead: false},
  {id: 'MSG-008', orderId: 'ORD-1012', senderId: 'USR-004', senderName: 'Priya Reddy', content: 'Please let me know once the delivery partner picks this up.', isSystemMessage: false, timestamp: '2026-08-17T09:00:00', isRead: true},
  {id: 'MSG-009', orderId: 'ORD-1015', senderId: 'USR-005', senderName: 'Arjun Kumar', content: 'Is there an estimated delivery date for my monitor?', isSystemMessage: false, timestamp: '2026-08-20T10:00:00', isRead: false},
  {id: 'MSG-010', orderId: 'ORD-1018', senderId: null, senderName: 'System', content: 'A dispute has been opened for this order.', isSystemMessage: true, timestamp: '2026-08-11T10:00:00', isRead: true},
  {id: 'MSG-011', orderId: 'ORD-1018', senderId: 'USR-006', senderName: 'Meera Nair', content: 'The delivered band is not charging even after following the instructions.', isSystemMessage: false, timestamp: '2026-08-11T10:05:00', isRead: true},
]

const disputes = [
  {
    id: 'DSP-001', orderId: 'ORD-1004', raisedBy: 'USR-001', reasonCategory: 'Damaged Item',
    description: 'The monitor stand arrived with a damaged base and cannot be used safely.', status: 'Under Review',
    adminResolutionNotes: 'Support team is checking the delivery photos and warehouse packing record.', createdAt: '2026-08-14T18:00:00', updatedAt: '2026-08-15T10:20:00',
  },
  {
    id: 'DSP-002', orderId: 'ORD-1018', raisedBy: 'USR-006', reasonCategory: 'Other',
    description: 'The delivered smart band does not power on even after charging it overnight.', status: 'Open',
    adminResolutionNotes: '', createdAt: '2026-08-11T10:00:00', updatedAt: '2026-08-11T10:00:00',
  },
]

const seed = async () => {
  try {
    await connectDB()

    await User.deleteMany({})
    await Order.deleteMany({})
    await Message.deleteMany({})
    await Dispute.deleteMany({})

    const customerPasswordHash = await bcrypt.hash('Customer@123', 10)
    const adminPasswordHash = await bcrypt.hash('DotEye@123', 10)

    await User.insertMany(users.map(user => ({
      ...user,
      passwordHash: user.role === 'Admin' ? adminPasswordHash : customerPasswordHash,
    })))

    await Order.insertMany(orders)
    await Message.insertMany(messages)
    await Dispute.insertMany(disputes)

    console.log('Seed completed successfully.')
    console.log('')
    console.log('Customer demo logins:')
    console.log('Vikash: vikash@example.com / Customer@123')
    console.log('Ananya: ananya@example.com / Customer@123')
    console.log('Rahul: rahul@example.com / Customer@123')
    console.log('Priya: priya@example.com / Customer@123')
    console.log('Arjun: arjun@example.com / Customer@123')
    console.log('Meera: meera@example.com / Customer@123')
    console.log('')
    console.log('Admin demo login:')
    console.log('DotEye Support Admin: admin@doteyelabs.com / DotEye@123')
  } catch (error) {
    console.error('Seed failed:', error.message)
  } finally {
    process.exit()
  }
}

seed()
