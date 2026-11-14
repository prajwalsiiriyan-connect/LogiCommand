const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/routeController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/recommendations', ctrl.getRecommendations);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
