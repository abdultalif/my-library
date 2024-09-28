import { NextFunction, Request, Response } from 'express';
import { Book } from '../model/book-model';
import { ResponseError } from '../error/response-error';

export const checkBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find();

    if (books.length === 0) throw new ResponseError('Failed', 404, 'Books not found');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Books checked successfully',
      data: books,
    });
  } catch (error) {
    next(error);
  }
};
