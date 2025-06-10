const express = require('express')
const router = express.Router();
const reviewPr = require('../controller/reviewController')

router.post('/review',reviewPr);

module.exports = router;