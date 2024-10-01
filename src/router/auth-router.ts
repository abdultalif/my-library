import { Router } from 'express';
import { login, refreshToken, register, setActiveUser } from '../controller/auth-controller';

const router = Router();

router.post('/auth', register);
router.get('/auth/set-active/:email/:memberId', setActiveUser);
router.post('/auth/login', login);
router.post('/auth/refresh-token', refreshToken);

export default router;
