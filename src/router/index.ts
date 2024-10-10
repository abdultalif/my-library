import express from 'express';
import Book from './book-router';
import User from './user-router';
import Auth from './auth-router';

const router = express.Router();

router.use('/api/v1', Book);
router.use('/api/v1', User);
router.use('/api/v1/auth', Auth);

export default router;
