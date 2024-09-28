import express from 'express';
import Book from './book-router';
import Member from './member-router';

const router = express.Router();

router.use('/api', Book);
router.use('/api', Member);

export default router;
