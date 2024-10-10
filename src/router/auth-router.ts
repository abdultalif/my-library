import { Router } from 'express';
import {
  forgotPassword,
  login,
  refreshToken,
  register,
  resetPassword,
  setActiveToken,
  setActiveUser,
} from '../controller/auth-controller';

const router = Router();

router.post('/', register);
router.get('/set-active/:email/:memberId', setActiveUser);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.get('/set-active-token/:token', setActiveToken);
router.patch('/reset-password/:token', resetPassword);

export default router;
