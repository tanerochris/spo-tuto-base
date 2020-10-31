/* eslint no-underscore-dangle: "off" */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const TransactionSchema = new Schema(
  {
    serial: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true
    },
    flutter_wave_reference: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending'
    },
    payment_method: {
      type: String,
      enum: ['card', 'momo', 'bank'],
      default: 'card'
    },
    amount: {
      type: Number,
      default: 0.0,
      required: true
    },
    charges: {
      type: Number,
      default: 0.0
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true
    },
    currency: {
      type: String,
      default: 'XAF'
    }
  },
  {
    timestamps: true
  } 
);
TransactionSchema.pre('validate', async function (){
    const count = await this.constructor.count();
    this.serial = String( 10000001 + count);
});
TransactionSchema.methods.view = function view(summary = false) {
  const transaction = JSON.parse(JSON.stringify(this));
  transaction.id = transaction._id;
  delete transaction._id;
  delete transaction.__v;
  const { 
    id,
    serial,
    amount,
    reason,
    payment_method,
    createdBy,
    campaign,
    charges } = transaction;

  return summary
    ? {
    id,
    serial,
    amount,
    charges,
    currency,
    createdAt
  } : Object.assign(transaction, { id, reason, payment_method, createdBy, campaign, charges });
};
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
