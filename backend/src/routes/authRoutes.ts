import express from 'express';
import { registerUser, authUser } from '../controllers/authController';
import { check } from 'express-validator';
import { validateResult } from '../middleware/validationMiddleware';

const router = express.Router();

router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], validateResult, registerUser);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], validateResult, authUser);



export default router;
