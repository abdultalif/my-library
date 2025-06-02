import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../error/response-error';
import { verify } from 'jsonwebtoken';
import CONFIG from '../config/environment';

export const authentication = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];

  if (!token) {
    throw new ResponseError('Failed', 401, 'Unauthorized');
  }

  if (!CONFIG.jwtSecret) {
    throw new ResponseError('Failed', 500, 'INTERNAL SERVER ERROR');
  }

  const user = verify(token, CONFIG.jwtSecret);

  if (!user) {
    throw new ResponseError('Failed', 401, 'Unauthorized');
  }

  (req as any).user = user;
  next();
};
