const express = require('express');
const router = express.Router();
const { predictDropout } = require('../controllers/predictController');

router.post('/', predictDropout);

module.exports = router;
