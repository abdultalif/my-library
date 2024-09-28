import { NextFunction, Request, Response } from 'express';
import { ResponseError } from '../error/response-error';

const errorMiddleware = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next();
  }

  if (err instanceof ResponseError) {
    res
      .status(err.statusCode)
      .json({
        status: err.status,
        statusCode: err.statusCode,
        errors: err.message,
      })
      .end();
  } else {
    res
      .status(500)
      .json({
        status: 'failed',
        statusCode: 500,
        errors: err.message,
      })
      .end();
  }
};

export { errorMiddleware };
