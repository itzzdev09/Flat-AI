import express from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import { requireAdmin } from '../Middleware/adminMiddleware.js';
import {
  createProperty,
  deleteProperty,
  getAdminSummary,
  getAdminDashboard,
  getProperties,
  getUsers,
  updateProperty,
  updateUserRole,
} from '../Controllers/adminController.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/summary', getAdminSummary);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/properties', getProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

export default router;
