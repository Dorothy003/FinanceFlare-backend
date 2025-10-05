
import express from 'express';
import { getDashboardData, updateCard, addTransaction, getCard, getChartData,getAllTransactions } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/card', protect, getCard);

router.put('/card', protect, updateCard);
router.post('/transactions', protect, addTransaction);
router.get('/chartdata',protect, getChartData);
router.get('/transactions', protect, getAllTransactions);


export default router;
