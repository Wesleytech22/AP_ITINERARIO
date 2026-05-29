// routes/content.js
const router = require('express').Router();
const ctrl = require('../controllers/contentController');
const { auth } = require('../middleware/auth');

router.get('/videos', ctrl.getVideos);
router.post('/videos/:id/watch', ctrl.watchVideo);

router.get('/games', ctrl.getGames);
router.post('/games/:id/score', auth, ctrl.saveScore);
router.get('/games/leaderboard', ctrl.getLeaderboard);

router.get('/cards', ctrl.getCards);
router.get('/news', ctrl.getNews);
router.get('/leaderboard', ctrl.getGlobalLeaderboard);
router.get('/stats', ctrl.getStats);

module.exports = router;
