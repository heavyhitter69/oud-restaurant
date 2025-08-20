import express from 'express';
const router = express.Router();
import {
  createPromo,
  getAllPromos,
  validatePromo,
  applyPromo,
  deletePromo,
  togglePromoStatus
} from '../controllers/promoController.js';

// Admin routes
router.post('/create', createPromo);
router.get('/list', getAllPromos);
router.delete('/delete/:id', deletePromo);
router.patch('/toggle/:id', togglePromoStatus);

// User routes
router.post('/validate', validatePromo);
router.post('/apply', applyPromo);

export default router;
