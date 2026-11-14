const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Active', 'Resolved', 'Acknowledged'], default: 'Active' },
  relatedId: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Shipment', 'Inventory', 'Order', 'Supplier', 'System'],
    default: 'System',
  },
  assignedTo: { type: String, default: '' },
  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
