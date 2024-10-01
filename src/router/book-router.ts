import { Router } from 'express';
import { addBook, checkBook, checkBooks, deleteBook, updateBook } from '../controller/book-controller';

const router = Router();

router.get('/books', checkBooks);
router.get('/books/:code', checkBook);
router.post('/books', addBook);
router.delete('/books/:code', deleteBook);
router.patch('/books/:code', updateBook);

export default router;
