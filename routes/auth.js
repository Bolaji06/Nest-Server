
import express from 'express';
import { forgotPassword, login, logout, register, resetPassword, verifyEmail } from '../controllers/auth.controllers.js';
import { checkSchema } from 'express-validator'
import { registerValidation } from '../utils/validation.js';

const router = express.Router();

router.post('/register',  register)

router.post('/login', login)

router.post('/logout', logout);

router.get('/verify', verifyEmail);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

export default router;