// quizRoutes.js – Instituto Aiye
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/ocorrenciaController');

router.get('/',              ctrl.listar);
router.get('/:id/perguntas', ctrl.perguntas);
router.post('/:id/responder', auth, ctrl.responder);

module.exports = router;
