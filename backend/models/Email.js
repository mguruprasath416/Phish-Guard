const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isPhishing: { type: Boolean, required: true },
  indicators: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', emailSchema);
