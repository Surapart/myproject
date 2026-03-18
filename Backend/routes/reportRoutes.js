const express = require('express');
const router = express.Router();
const { getDailyReport, getMonthlyReport, getYearlyReport } = require('../controllers/reportController');

router.get('/daily',   getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/yearly',  getYearlyReport);

module.exports = router;