const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/overview', getOverview);

module.exports = router;
