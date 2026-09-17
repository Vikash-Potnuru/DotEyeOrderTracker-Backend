const mongoose = require('mongoose')
const {
  DISPUTE_CATEGORIES,
  DISPUTE_STATUSES,
} = require('../constants/orderConstants')

const disputeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      index: true,
    },

    raisedBy: {
      type: String,
      required: true,
      index: true,
    },

    reasonCategory: {
      type: String,
      enum: DISPUTE_CATEGORIES,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: DISPUTE_STATUSES,
      default: 'Open',
      index: true,
    },

    adminResolutionNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
)

disputeSchema.index({orderId: 1, status: 1})

module.exports = mongoose.model('Dispute', disputeSchema)
