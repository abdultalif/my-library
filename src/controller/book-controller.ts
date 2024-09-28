import { NextFunction, Request, Response } from 'express';
import { Book } from '../model/book-model';

export const checkBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find();
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
