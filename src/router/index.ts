import express from 'express';
import Book from './book-router';
import Member from './member-router';
import Auth from './auth-router';

const router = express.Router();

router.use('/api/v1/', Book);
router.use('/api/v1/', Member);
router.use('/api/v1/auth', Auth);

export default router;
