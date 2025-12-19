import express from 'express';
import { getUsers, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';
import { param } from 'express-validator';
import { validateResult } from '../middleware/validationMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .delete(protect, authorize('admin'), [
        param('id', 'Invalid User ID').isMongoId()
    ], validateResult, deleteUser);

export default router;
