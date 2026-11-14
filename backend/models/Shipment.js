const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  carrier: { type: String, required: true },
  weight: { type: Number, required: true },
  status: {
    type: String,
    enum: ['In Transit', 'Delivered', 'Delayed', 'Pending'],
    default: 'Pending',
  },
  estimatedDelivery: { type: Date, required: true },
  currentLocation: { type: String, default: '' },
  trackingEvents: [{
    location: String,
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  customer: { type: String, default: '' },
  value: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
