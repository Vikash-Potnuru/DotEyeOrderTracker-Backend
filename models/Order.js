const mongoose = require('mongoose')
const {ORDER_STATUSES} = require('../constants/orderConstants')

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
)

const timelineSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },

    updatedBy: {
      type: String,
      enum: ['Customer', 'System', 'Admin'],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  }
)

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: String,
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: 'Placed',
      index: true,
    },

    timelineHistory: {
      type: [timelineSchema],
      default: [],
    },

    statusBeforeDispute: {
      type: String,
      enum: ORDER_STATUSES,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Order', orderSchema)
