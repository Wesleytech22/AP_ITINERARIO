// progressoRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/progressoController');

router.get('/ranking',  ctrl.ranking);
router.get('/me',       auth, ctrl.buscar);
router.post('/me',      auth, ctrl.salvar);
router.get('/:id',      auth, ctrl.buscar);

module.exports = router;
