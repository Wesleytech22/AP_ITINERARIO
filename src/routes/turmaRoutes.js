// jogoRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/jogoController');

router.post('/',         auth, ctrl.registrar);
router.get('/historico', auth, ctrl.historico);
router.get('/stats',     auth, ctrl.estatisticas);

module.exports = router;
