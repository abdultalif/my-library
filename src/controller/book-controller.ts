import { NextFunction, Request, Response } from 'express';
import { BookModel } from '../model/book-model';
import { ResponseError } from '../error/response-error';
import logger from '../utils/logging';
import { addBookSchema, updateBookSchema } from '../validation/books-validation';
import { validation } from '../validation/validate';
import { generateCode } from '../utils/code-generator';

export const checkBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await BookModel.find();

    if (books.length === 0) throw new ResponseError('Failed', 404, 'Books not found');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Books checked successfully',
      data: books,
    });
    logger.info('Books checked successfully');
  } catch (error) {
    next(error);
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
  }
};

export const checkBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await BookModel.findOne({ code: req.params.code });

    if (!book) throw new ResponseError('Failed', 404, 'Book not found');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Book checked successfully',
      data: book,
    });
    logger.info('Book checked successfully');
  } catch (error) {
    next(error);
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
  }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(addBookSchema, req.body);

    const bookExist = await BookModel.findOne({ title: validateData.title });
    if (bookExist) throw new ResponseError('Failed', 409, 'Book already exist');

    const code = await generateCode(BookModel, 'B');
    await BookModel.create({
      code: code,
      ...validateData,
    });

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Book added successfully',
    });
    logger.info('Book added successfully');
  } catch (error) {
    next(error);
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookExist = await BookModel.findOne({ code: req.params.code });
    if (!bookExist) throw new ResponseError('Failed', 404, 'Book not found');
    await BookModel.deleteOne({ code: req.params.code });
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Book deleted successfully',
    });
    logger.info('Book deleted successfully');
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateData = await validation.validate(updateBookSchema, req.body);
    const bookExist = await BookModel.findOne({ code: req.params.code });
    if (!bookExist) throw new ResponseError('Failed', 404, 'Book not found');
    await BookModel.updateOne({ code: req.params.code }, validateData);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Book updated successfully',
    });

    logger.info('Book updated successfully');
  } catch (error) {
    if (error instanceof ResponseError) {
      logger.error(`${error.statusCode}: ${error.message}`);
    }
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    next(error);
  }
};
