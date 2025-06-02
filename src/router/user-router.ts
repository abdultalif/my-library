import { Router } from 'express';
import { returnBook, checkMembers, borrowBook } from '../controller/user-contoller';
import { authentication } from '../middleware/auth-middleware';

const router = Router();

router.post('/borrow', authentication, borrowBook);
router.post('/return', authentication, returnBook);
router.get('/users', authentication, checkMembers);

export default router;
