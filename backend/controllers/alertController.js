const Alert = require('../models/Alert');

exports.getAll = async (req, res) => {
  try {
    const { status, severity, search, category } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (severity && severity !== 'All') query.severity = severity;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(100);
    const total = await Alert.countDocuments(query);
    res.json({ alerts, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    if (req.io) req.io.to('dashboard').emit('new_alert', alert);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.body.status === 'Resolved') req.body.resolvedAt = new Date();
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, active, resolved, critical] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'Active' }),
      Alert.countDocuments({ status: 'Resolved' }),
      Alert.countDocuments({ severity: 'Critical', status: 'Active' }),
    ]);
    res.json({ total, active, resolved, critical });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
