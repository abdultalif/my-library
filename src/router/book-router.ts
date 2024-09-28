import { Router } from 'express';
import { checkBooks } from '../controller/book-controller';

const router = Router();

router.get('/books', checkBooks);

export default router;
