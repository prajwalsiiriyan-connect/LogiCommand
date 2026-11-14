const RouteOpt = require('../models/RouteOpt');

exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { routeId: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { carrier: { $regex: search, $options: 'i' } },
      ];
    }
    const routes = await RouteOpt.find(query).sort({ efficiency: -1 });
    res.json({ routes, total: routes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const route = await RouteOpt.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const count = await RouteOpt.countDocuments();
    const routeId = `RTE-${String(count + 1).padStart(3, '0')}`;
    const efficiency = Math.round(100 - (req.body.fuelCost / req.body.distance) * 10);
    const route = await RouteOpt.create({ ...req.body, routeId, efficiency: Math.max(0, Math.min(100, efficiency)) });
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const route = await RouteOpt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const route = await RouteOpt.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    let query = {};
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    const routes = await RouteOpt.find(query).sort({ efficiency: -1 }).limit(5);
    res.json({ recommendations: routes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
