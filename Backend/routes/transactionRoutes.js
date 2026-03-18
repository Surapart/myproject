const express = require('express');
const router = express.Router();
const { getAllTransactions, getTransactionById, createTransaction } = require('../controllers/transactionController');

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);

module.exports = router;