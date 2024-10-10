import { Router } from 'express';
import { returnBook, checkMembers, borrowBook } from '../controller/user-contoller';

const router = Router();

router.post('/borrow', borrowBook);
router.post('/return', returnBook);
router.get('/users', checkMembers);

export default router;
