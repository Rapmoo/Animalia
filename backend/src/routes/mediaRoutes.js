const express = require('express');

const mediaController = require('../controllers/mediaController');

const router = express.Router();

router.get('/:id', mediaController.streamMedia);

module.exports = router;