const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  warehouse: { type: String, required: true },
  stockQty: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true },
  unitPrice: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock',
  },
  lastRestocked: { type: Date, default: Date.now },
  image: { type: String, default: '' },
}, { timestamps: true });

inventorySchema.pre('save', function (next) {
  if (this.stockQty === 0) {
    this.status = 'Out of Stock';
  } else if (this.stockQty <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
