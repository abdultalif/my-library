import { Router } from 'express';
import { addBook, checkBook, checkBooks, deleteBook, updateBook } from '../controller/book-controller';
import { authentication } from '../middleware/auth-middleware';

const router = Router();

router.get('/books', authentication, checkBooks);
router.get('/books/:code', authentication, checkBook);
router.post('/books', authentication, addBook);
router.delete('/books/:code', authentication, deleteBook);
router.patch('/books/:code', authentication, updateBook);

export default router;
