// routes/moments.js
const router = require('express').Router();
const ctrl = require('../controllers/momentsController');
const { auth } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.post('/', auth, ctrl.create);
router.post('/:id/like', auth, ctrl.like);
router.post('/:id/comments', auth, ctrl.comment);
router.get('/:id/comments', ctrl.getComments);

// Volunteer hours
router.post('/hours', auth, ctrl.logHours);
router.get('/hours/my', auth, ctrl.getMyHours);

module.exports = router;
