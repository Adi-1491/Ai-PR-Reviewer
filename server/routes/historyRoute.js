const express = require('express');
const { createHistory, getHistory, deleteHistory, deleteAllHistory } = require('../controller/historyController');
const router = express.Router();

router.post('/history', createHistory);
router.get('/history',  getHistory);
router.delete('/history/:id', deleteHistory);
router.delete('/history',deleteAllHistory);

module.exports = router;
