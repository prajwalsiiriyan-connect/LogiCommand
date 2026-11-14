const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const Alert = require('../models/Alert');

exports.getOverview = async (req, res) => {
  try {
    const [
      activeShipments,
      ordersFulfilled,
      delayedShipments,
      lowStockItems,
      activeSuppliers,
      criticalAlerts,
      recentShipments,
      recentAlerts,
      topSuppliers,
    ] = await Promise.all([
      Shipment.countDocuments({ status: 'In Transit' }),
      Order.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Delayed' }),
      Inventory.countDocuments({ status: { $in: ['Low Stock', 'Out of Stock'] } }),
      Supplier.countDocuments({ status: 'Active' }),
      Alert.countDocuments({ severity: 'Critical', status: 'Active' }),
      Shipment.find().sort({ createdAt: -1 }).limit(6),
      Alert.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(5),
      Supplier.find({ status: 'Active' }).sort({ rating: -1 }).limit(5).select('supplierName rating onTimeRate region totalOrders'),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly data (last 7 months)
    const now = new Date();
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const [shipCount, orderCount, revenue] = await Promise.all([
        Shipment.countDocuments({ createdAt: { $gte: d, $lt: next } }),
        Order.countDocuments({ orderDate: { $gte: d, $lt: next } }),
        Order.aggregate([
          { $match: { orderDate: { $gte: d, $lt: next }, status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$value' } } },
        ]),
      ]);
      monthlyData.push({
        month: monthNames[d.getMonth()],
        shipments: shipCount,
        orders: orderCount,
        revenue: revenue[0]?.total || 0,
      });
    }

    res.json({
      stats: {
        activeShipments,
        ordersFulfilled,
        delayedShipments,
        lowStockItems,
        activeSuppliers,
        criticalAlerts,
        totalRevenue,
      },
      recentShipments,
      recentAlerts,
      topSuppliers,
      monthlyData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
