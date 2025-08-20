import express from 'express';
const router = express.Router();
import { loginUser, registerUser, getUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/profile', authMiddleware, getUserProfile);

export default router;