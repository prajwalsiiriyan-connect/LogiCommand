const mongoose = require('mongoose');

const routeOptSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  carrier: { type: String, required: true },
  distance: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  fuelCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Recommended'], default: 'Active' },
  efficiency: { type: Number, default: 0 },
  co2Emission: { type: Number, default: 0 },
  stops: [{ type: String }],
  vehicleType: { type: String, default: 'Truck' },
}, { timestamps: true });

module.exports = mongoose.model('RouteOpt', routeOptSchema);
