// animaisRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/animaisController');

router.get('/',    ctrl.listar);
router.get('/:id', ctrl.buscar);

module.exports = router;
