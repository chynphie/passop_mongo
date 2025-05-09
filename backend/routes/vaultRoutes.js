const express = require('express');
const router  = express.Router();
const vaultController = require('../controllers/vaultController');
// const { ensureAuth } = require('./middleware/auth');

router.post('/save', vaultController.saveVault);
router.get('/:userId', vaultController.getEntries);

module.exports = router;