const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { carrier: { $regex: search, $options: 'i' } },
        { currentLocation: { $regex: search, $options: 'i' } },
      ];
    }
    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Shipment.countDocuments(query);
    res.json({ shipments, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await Shipment.countDocuments();
    const shipmentId = `SHP-${String(count + 1).padStart(4, '0')}`;
    const shipment = await Shipment.create({ ...req.body, shipmentId });
    if (req.io) {
      req.io.to('dashboard').emit('shipment_created', shipment);
    }
    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (req.body.status === 'Delayed') {
      await Alert.create({
        type: 'Delay Alert',
        message: `Shipment ${shipment.shipmentId} marked as delayed`,
        severity: 'High',
        status: 'Active',
        relatedId: shipment.shipmentId,
        category: 'Shipment',
      });
    }
    if (req.io) req.io.to('dashboard').emit('shipment_updated', shipment);
    res.json(shipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, inTransit, delivered, delayed, pending] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: 'In Transit' }),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Delayed' }),
      Shipment.countDocuments({ status: 'Pending' }),
    ]);
    res.json({ total, inTransit, delivered, delayed, pending });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
