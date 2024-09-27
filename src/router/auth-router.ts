import { login, register } from '../controller/auth-controller';
import { Router } from 'express';

const router: Router = Router();

router.post('/login', login);
router.post('/register', register);

export default router;
