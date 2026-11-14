const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/routes', require('./routes/routeOpt'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Logistics API running', timestamp: new Date() });
});

// Socket.IO real-time events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join_dashboard', () => {
    socket.join('dashboard');
    console.log(`Socket ${socket.id} joined dashboard room`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time shipment updates every 8 seconds
const Shipment = require('./models/Shipment');
const Alert = require('./models/Alert');

const STATUSES = ['In Transit', 'Delivered', 'Delayed', 'Pending'];
const LOCATIONS = [
  'Mumbai Port', 'Delhi Hub', 'Chennai Warehouse', 'Kolkata Depot',
  'Bangalore Facility', 'Hyderabad Center', 'Pune Junction', 'Ahmedabad Yard',
  'Surat Terminal', 'Jaipur Logistics Park',
];

setInterval(async () => {
  try {
    const shipments = await Shipment.find({ status: { $in: ['In Transit', 'Pending'] } }).limit(3);
    if (shipments.length > 0) {
      const shipment = shipments[Math.floor(Math.random() * shipments.length)];
      const newLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const shouldDelay = Math.random() < 0.15;
      const newStatus = shouldDelay ? 'Delayed' : shipment.status;

      await Shipment.findByIdAndUpdate(shipment._id, {
        currentLocation: newLocation,
        status: newStatus,
      });

      if (shouldDelay) {
        await Alert.create({
          type: 'Delay Alert',
          message: `Shipment ${shipment.shipmentId} has been delayed at ${newLocation}`,
          severity: 'High',
          status: 'Active',
          relatedId: shipment.shipmentId,
        });
      }

      io.to('dashboard').emit('shipment_update', {
        shipmentId: shipment.shipmentId,
        currentLocation: newLocation,
        status: newStatus,
        timestamp: new Date(),
      });

      io.to('dashboard').emit('live_alert', {
        message: `📦 ${shipment.shipmentId} updated → ${newLocation}`,
        type: shouldDelay ? 'warning' : 'info',
        timestamp: new Date(),
      });
    }
  } catch (err) {
    // Silent fail for simulation
  }
}, 8000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Logistics API Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time updates`);
  console.log(`🌐 http://localhost:${PORT}\n`);
});
