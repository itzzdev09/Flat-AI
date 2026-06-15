import express from 'express';
import { changePassword, login, me, signup, updateProfile } from '../Controllers/authController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);
router.put('/me', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
