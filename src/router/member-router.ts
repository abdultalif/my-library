import { Router } from 'express';
import { returnBook, checkMembers, borrowBook } from '../controller/member-contoller';

const router = Router();

router.post('/borrow', borrowBook);
router.post('/return', returnBook);
router.get('/members', checkMembers);

export default router;
