require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const Alert = require('../models/Alert');
const RouteOpt = require('../models/RouteOpt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/logistics_db';

const carriers = ['FedEx Logistics', 'DHL Express', 'Blue Dart', 'DTDC Courier', 'Ekart Logistics', 'XpressBees', 'Delhivery', 'Gati KWE'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kochi', 'Nagpur', 'Indore', 'Bhopal'];
const warehouses = ['Mumbai Warehouse A', 'Delhi Central Hub', 'Bangalore Facility B', 'Chennai Port Depot', 'Kolkata East Yard', 'Hyderabad Tech Park'];
const categories = ['Electronics', 'Automotive', 'FMCG', 'Pharmaceuticals', 'Textiles', 'Industrial Equipment', 'Food & Beverage', 'Chemicals'];
const regions = ['North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India'];
const statuses = ['In Transit', 'Delivered', 'Delayed', 'Pending'];
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const staffNames = ['Arun Kumar', 'Priya Sharma', 'Rahul Verma', 'Sunita Patel', 'Vikram Singh', 'Meera Nair', 'Arjun Das', 'Kavitha Rao'];
const supplierNames = [
  'Tata Logistics Pvt Ltd', 'Reliance Supply Chain', 'Adani Ports & SEZ', 'Mahindra Logistics',
  'TVS Supply Chain Solutions', 'Allcargo Logistics', 'Blue Dart Aviation', 'VRL Logistics',
  'TCI Express', 'GATI Limited', 'Safexpress Pvt Ltd', 'Rivigo Technologies',
  'Delhivery Limited', 'Ecom Express', 'Shadowfax Technologies',
];
const productNames = [
  'Industrial Motor 5HP', 'LED Display Panel 32"', 'Hydraulic Pump Unit', 'Conveyor Belt Set',
  'Electric Control Board', 'Steel Wire Rope 50m', 'Pressure Gauge 150PSI', 'Centrifugal Pump',
  'Solar Panel 400W', 'Diesel Generator 10KVA', 'Air Compressor 100L', 'Water Purification Unit',
  'Laptop Core i7 Gen12', 'Server Rack 42U', 'Network Switch 48-Port', 'UPS System 3KVA',
  'Automotive Brake Pads', 'Engine Oil Filter', 'Coolant Fluid 5L', 'Spark Plug Set',
  'Paracetamol Tablets 500mg', 'Surgical Gloves Box', 'Medical Syringes 10ml', 'IV Fluid Bag',
  'Organic Rice 50kg', 'Wheat Flour 25kg', 'Edible Oil 15L', 'Sugar 50kg',
  'Cotton Fabric Roll', 'Polyester Thread', 'Denim Cloth Bale', 'Silk Fabric Premium',
];
const alertTypes = ['Delay Alert', 'Low Stock Alert', 'Contract Expiry', 'Customs Hold', 'Weather Disruption', 'Vehicle Breakdown', 'System Alert', 'Payment Overdue'];
const alertCategories = ['Shipment', 'Inventory', 'Supplier', 'Order', 'System'];
const routeOrigins = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const vehicleTypes = ['Truck 20T', 'Mini Truck 5T', 'Container 40ft', 'Rail Freight', 'Air Cargo', 'Refrigerated Van'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }
function daysFromNow(days) { return new Date(Date.now() + days * 24 * 60 * 60 * 1000); }
function daysAgo(days) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Shipment.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Supplier.deleteMany({}),
      Alert.deleteMany({}),
      RouteOpt.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── USERS ──────────────────────────────────────────────
    const hashedPass = await bcrypt.hash('admin123', 12);
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@supplychain.com', password: hashedPass, role: 'admin' },
      { name: 'Ravi Sharma', email: 'ravi@supplychain.com', password: hashedPass, role: 'manager' },
      { name: 'Priya Nair', email: 'priya@supplychain.com', password: hashedPass, role: 'viewer' },
    ]);
    console.log(`✅ Seeded ${users.length} users`);

    // ── SUPPLIERS ──────────────────────────────────────────
    const suppliers = [];
    for (let i = 0; i < 15; i++) {
      const name = supplierNames[i];
      const region = randomFrom(regions);
      const rating = randomFloat(2.5, 5.0);
      const onTimeRate = randomInt(60, 99);
      const contractDays = randomInt(-10, 365);
      suppliers.push({
        supplierId: `SUP-${String(i + 1).padStart(3, '0')}`,
        supplierName: name,
        region,
        category: randomFrom(categories),
        contactPerson: randomFrom(staffNames),
        email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+91 ${randomInt(7000000000, 9999999999)}`,
        totalOrders: randomInt(50, 800),
        rating: parseFloat(rating.toFixed(1)),
        onTimeRate,
        contractExpiry: daysFromNow(contractDays),
        status: contractDays < 0 ? 'Inactive' : (rating < 3 ? 'Under Review' : 'Active'),
        country: 'India',
        currency: 'INR',
        paymentTerms: randomFrom(['Net 15', 'Net 30', 'Net 45', 'Immediate']),
      });
    }
    const savedSuppliers = await Supplier.insertMany(suppliers);
    console.log(`✅ Seeded ${savedSuppliers.length} suppliers`);

    // ── SHIPMENTS ──────────────────────────────────────────
    const shipments = [];
    for (let i = 0; i < 60; i++) {
      const origin = randomFrom(cities);
      let destination = randomFrom(cities);
      while (destination === origin) destination = randomFrom(cities);
      const status = i < 5 ? 'Delayed' : (i < 20 ? 'In Transit' : (i < 45 ? 'Delivered' : 'Pending'));
      shipments.push({
        shipmentId: `SHP-${String(i + 1).padStart(4, '0')}`,
        origin,
        destination,
        carrier: randomFrom(carriers),
        weight: randomFloat(10, 5000),
        status,
        estimatedDelivery: status === 'Delivered' ? daysAgo(randomInt(1, 30)) : daysFromNow(randomInt(1, 20)),
        currentLocation: randomFrom(cities),
        priority: randomFrom(priorities),
        customer: randomFrom(staffNames),
        value: randomInt(5000, 500000),
        trackingEvents: [
          { location: origin, status: 'Picked Up', timestamp: daysAgo(randomInt(3, 10)), note: 'Shipment picked up from origin' },
          { location: randomFrom(cities), status: 'In Transit', timestamp: daysAgo(randomInt(1, 3)), note: 'In transit to hub' },
        ],
        createdAt: daysAgo(randomInt(1, 60)),
      });
    }
    const savedShipments = await Shipment.insertMany(shipments);
    console.log(`✅ Seeded ${savedShipments.length} shipments`);

    // ── INVENTORY ──────────────────────────────────────────
    const inventoryItems = [];
    for (let i = 0; i < 40; i++) {
      const reorderLevel = randomInt(20, 100);
      const stockQty = i < 5 ? 0 : (i < 15 ? randomInt(1, reorderLevel) : randomInt(reorderLevel + 1, 2000));
      const status = stockQty === 0 ? 'Out of Stock' : (stockQty <= reorderLevel ? 'Low Stock' : 'In Stock');
      inventoryItems.push({
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        productName: productNames[i % productNames.length],
        category: randomFrom(categories),
        warehouse: randomFrom(warehouses),
        stockQty,
        reorderLevel,
        unitPrice: randomInt(100, 50000),
        supplier: randomFrom(supplierNames),
        status,
        lastRestocked: daysAgo(randomInt(1, 90)),
      });
    }
    const savedInventory = await Inventory.insertMany(inventoryItems);
    console.log(`✅ Seeded ${savedInventory.length} inventory items`);

    // ── ORDERS ────────────────────────────────────────────
    const orders = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    for (let i = 0; i < 80; i++) {
      const status = orderStatuses[i % orderStatuses.length];
      const daysBack = randomInt(0, 180);
      const qty = randomInt(1, 100);
      const unitVal = randomInt(500, 50000);
      orders.push({
        orderId: `ORD-${String(i + 1).padStart(4, '0')}`,
        customer: `${randomFrom(['Acme Corp', 'Zenith Ltd', 'Vertex Inc', 'Nexus Co', 'Apex Solutions', 'Prime Enterprises', 'Global Traders', 'Metro Industries'])} - ${randomInt(100, 999)}`,
        product: productNames[i % productNames.length],
        quantity: qty,
        value: qty * unitVal,
        status,
        assignedTo: randomFrom(staffNames),
        orderDate: daysAgo(daysBack),
        deliveryDate: status === 'Delivered' ? daysAgo(randomInt(0, daysBack)) : daysFromNow(randomInt(1, 30)),
        shippingAddress: `${randomInt(1, 999)}, ${randomFrom(cities)} - ${randomInt(100000, 999999)}`,
        notes: randomFrom(['', '', 'Fragile items', 'Priority delivery', 'Cold storage required', 'Requires signature']),
        priority: randomFrom(priorities.slice(0, 3)),
      });
    }
    const savedOrders = await Order.insertMany(orders);
    console.log(`✅ Seeded ${savedOrders.length} orders`);

    // ── ROUTES ────────────────────────────────────────────
    const routes = [];
    const routePairs = [
      ['Mumbai', 'Delhi'], ['Delhi', 'Bangalore'], ['Chennai', 'Kolkata'],
      ['Hyderabad', 'Mumbai'], ['Pune', 'Ahmedabad'], ['Bangalore', 'Chennai'],
      ['Mumbai', 'Kolkata'], ['Delhi', 'Lucknow'], ['Ahmedabad', 'Jaipur'],
      ['Kochi', 'Bangalore'], ['Nagpur', 'Mumbai'], ['Indore', 'Delhi'],
    ];
    routePairs.forEach(([origin, dest], i) => {
      const distance = randomInt(300, 2200);
      const hours = Math.ceil(distance / 60);
      const fuelCost = Math.round(distance * randomFloat(4.5, 7.5));
      const tollCost = randomInt(500, 5000);
      const totalCost = fuelCost + tollCost;
      const efficiency = Math.round(Math.min(100, Math.max(40, 100 - (fuelCost / distance) * 5)));
      routes.push({
        routeId: `RTE-${String(i + 1).padStart(3, '0')}`,
        origin, destination: dest,
        carrier: randomFrom(carriers),
        distance,
        estimatedTime: `${hours}h ${randomInt(0, 59)}m`,
        fuelCost,
        totalCost,
        status: i === 0 ? 'Recommended' : (i % 4 === 0 ? 'Inactive' : 'Active'),
        efficiency,
        co2Emission: Math.round(distance * 0.2),
        stops: i % 2 === 0 ? [randomFrom(cities)] : [randomFrom(cities), randomFrom(cities)],
        vehicleType: randomFrom(vehicleTypes),
      });
    });
    const savedRoutes = await RouteOpt.insertMany(routes);
    console.log(`✅ Seeded ${savedRoutes.length} routes`);

    // ── ALERTS ────────────────────────────────────────────
    const alertsData = [
      // Critical alerts
      { type: 'Delay Alert', message: 'SHP-0003 critically delayed at Nagpur due to road blockage', severity: 'Critical', status: 'Active', relatedId: 'SHP-0003', category: 'Shipment' },
      { type: 'Low Stock Alert', message: 'SKU-0001 stock critically low — only 8 units remaining at Mumbai Warehouse A', severity: 'Critical', status: 'Active', relatedId: 'SKU-0001', category: 'Inventory' },
      { type: 'Contract Expiry', message: 'Tata Logistics Pvt Ltd contract expires in 5 days', severity: 'Critical', status: 'Active', relatedId: 'SUP-001', category: 'Supplier' },
      { type: 'Customs Hold', message: 'SHP-0012 held at Mumbai Customs — documentation pending', severity: 'Critical', status: 'Active', relatedId: 'SHP-0012', category: 'Shipment' },
      // High alerts
      { type: 'Delay Alert', message: 'SHP-0005 delayed by 2 days due to weather conditions in Kerala', severity: 'High', status: 'Active', relatedId: 'SHP-0005', category: 'Shipment' },
      { type: 'Low Stock Alert', message: 'SKU-0008 Hydraulic Pump Unit below reorder level — restock immediately', severity: 'High', status: 'Active', relatedId: 'SKU-0008', category: 'Inventory' },
      { type: 'Vehicle Breakdown', message: 'Carrier vehicle TN-05-AB-1234 reported breakdown near Coimbatore', severity: 'High', status: 'Active', relatedId: 'SHP-0019', category: 'Shipment' },
      { type: 'Payment Overdue', message: 'Invoice INV-2024-0198 from Allcargo Logistics is 15 days overdue', severity: 'High', status: 'Acknowledged', relatedId: 'SUP-006', category: 'Supplier' },
      // Medium alerts
      { type: 'Low Stock Alert', message: 'SKU-0015 Server Rack 42U approaching reorder level', severity: 'Medium', status: 'Active', relatedId: 'SKU-0015', category: 'Inventory' },
      { type: 'Contract Expiry', message: 'Reliance Supply Chain contract expires in 28 days', severity: 'Medium', status: 'Active', relatedId: 'SUP-002', category: 'Supplier' },
      { type: 'System Alert', message: 'Scheduled maintenance window: 02:00–04:00 AM IST this Saturday', severity: 'Medium', status: 'Acknowledged', category: 'System' },
      { type: 'Weather Disruption', message: 'Cyclone warning issued for Chennai port — shipments may be affected', severity: 'Medium', status: 'Active', category: 'Shipment' },
      // Low / Resolved
      { type: 'Delay Alert', message: 'SHP-0022 minor delay — arrived 4 hours late at destination', severity: 'Low', status: 'Resolved', relatedId: 'SHP-0022', category: 'Shipment', resolvedAt: daysAgo(1) },
      { type: 'System Alert', message: 'Database backup completed successfully', severity: 'Low', status: 'Resolved', category: 'System', resolvedAt: daysAgo(2) },
      { type: 'Low Stock Alert', message: 'SKU-0033 restocked — stock levels normalized', severity: 'Low', status: 'Resolved', category: 'Inventory', resolvedAt: daysAgo(3) },
      { type: 'Delay Alert', message: 'SHP-0041 delivery confirmed after rescheduling', severity: 'Low', status: 'Resolved', category: 'Shipment', resolvedAt: daysAgo(1) },
    ];

    // Add timestamps spread across last 30 days
    const alertsWithTimestamps = alertsData.map((a, i) => ({
      ...a,
      createdAt: daysAgo(randomInt(0, 30)),
    }));
    const savedAlerts = await Alert.insertMany(alertsWithTimestamps);
    console.log(`✅ Seeded ${savedAlerts.length} alerts`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('🔐 Login credentials:');
    console.log('   Email   : admin@supplychain.com');
    console.log('   Password: admin123');
    console.log('─────────────────────────────────────\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
