import express from 'express';
import Book from './book-router';
import Member from './member-router';

const router = express.Router();

router.use('/api/v1/', Book);
router.use('/api/v1/', Member);

export default router;
