const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  region: { type: String, required: true },
  category: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  totalOrders: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  onTimeRate: { type: Number, min: 0, max: 100, default: 80 },
  contractExpiry: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive', 'Under Review'], default: 'Active' },
  country: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  paymentTerms: { type: String, default: 'Net 30' },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
