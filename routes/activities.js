// routes/activities.js
const router = require('express').Router();
const ctrl = require('../controllers/activitiesController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/my', auth, ctrl.myActivities);
router.get('/:id', ctrl.getOne);
router.post('/', auth, adminOnly, ctrl.create);
router.post('/:id/enroll', auth, ctrl.enroll);
router.delete('/:id/enroll', auth, ctrl.unenroll);

module.exports = router;
