const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');

exports.getAll = async (req, res) => {
  try {
    const { status, search, warehouse, category } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (warehouse && warehouse !== 'All') query.warehouse = warehouse;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Inventory.find(query).sort({ createdAt: -1 });
    const total = await Inventory.countDocuments(query);
    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    if (item.status === 'Low Stock') {
      await Alert.create({
        type: 'Low Stock Alert',
        message: `${item.productName} (${item.sku}) is running low - only ${item.stockQty} units left`,
        severity: 'Medium',
        status: 'Active',
        relatedId: item.sku,
        category: 'Inventory',
      });
    }
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, inStock, lowStock, outOfStock] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ status: 'In Stock' }),
      Inventory.countDocuments({ status: 'Low Stock' }),
      Inventory.countDocuments({ status: 'Out of Stock' }),
    ]);
    const warehouseStats = await Inventory.aggregate([
      { $group: { _id: '$warehouse', totalItems: { $sum: 1 }, totalStock: { $sum: '$stockQty' } } },
      { $sort: { totalStock: -1 } },
    ]);
    const categoryStats = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stockQty' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ total, inStock, lowStock, outOfStock, warehouseStats, categoryStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
