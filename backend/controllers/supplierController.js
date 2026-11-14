const Supplier = require('../models/Supplier');
const Alert = require('../models/Alert');

exports.getAll = async (req, res) => {
  try {
    const { status, search, region } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (region && region !== 'All') query.region = region;
    if (search) {
      query.$or = [
        { supplierId: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const suppliers = await Supplier.find(query).sort({ rating: -1 });
    res.json({ suppliers, total: suppliers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await Supplier.countDocuments();
    const supplierId = `SUP-${String(count + 1).padStart(3, '0')}`;
    const supplier = await Supplier.create({ ...req.body, supplierId });

    const expiry = new Date(supplier.contractExpiry);
    const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      await Alert.create({
        type: 'Contract Expiry',
        message: `Supplier ${supplier.supplierName} contract expires in ${daysLeft} days`,
        severity: daysLeft <= 7 ? 'Critical' : 'High',
        status: 'Active',
        relatedId: supplier.supplierId,
        category: 'Supplier',
      });
    }
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ status: 'Active' }),
      Supplier.countDocuments({ status: 'Inactive' }),
    ]);
    const avgRating = await Supplier.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' }, avgOnTime: { $avg: '$onTimeRate' } } },
    ]);
    const regionStats = await Supplier.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
    ]);
    const expiringContracts = await Supplier.find({
      contractExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    }).select('supplierName contractExpiry supplierId');

    res.json({
      total, active, inactive,
      avgRating: avgRating[0]?.avg?.toFixed(1) || 0,
      avgOnTimeRate: avgRating[0]?.avgOnTime?.toFixed(1) || 0,
      regionStats,
      expiringContracts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
